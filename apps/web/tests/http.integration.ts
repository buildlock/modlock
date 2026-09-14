import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { readdir, readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { Pool } from "pg";
import { getMigrations } from "better-auth/db/migration";
import { accountAuthOptions } from "../src/server/auth.ts";
import { getDatabase } from "../src/server/database.ts";
import { dropTestDatabase } from "./helpers/local-database.ts";
import { validatePersonalData } from "../src/lib/personal-data.ts";
try {
  process.loadEnvFile(".env.local");
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
test(
  "built Next.js server: authentication, protected pages, exports and public tools",
  { timeout: 60_000 },
  async (t) => {
    const probe = createServer();
    await new Promise<void>((resolve, reject) => {
      probe.once("error", reject);
      probe.listen(0, "127.0.0.1", resolve);
    });
    const port = (probe.address() as { port: number }).port;
    await new Promise<void>((resolve, reject) =>
      probe.close((e) => (e ? reject(e) : resolve())),
    );
    const origin = `http://127.0.0.1:${port}`,
      adminUrl = new URL(process.env.DATABASE_URL ?? "");
    if (!["127.0.0.1", "localhost", "[::1]"].includes(adminUrl.hostname))
      throw new Error("HTTP tests require a local database server.");
    const admin = new Pool({ connectionString: adminUrl.href, max: 1 }),
      name = `modlock_http_${randomBytes(12).toString("hex")}`,
      mail = await mkdtemp(join(tmpdir(), "modlock-http-mail-"));
    adminUrl.pathname = `/${name}`;
    Object.assign(process.env, {
      DATABASE_URL: adminUrl.href,
      MODLOCK_LOCAL_ACCOUNTS: "1",
      BETTER_AUTH_URL: origin,
      BETTER_AUTH_SECRET: randomBytes(48).toString("hex"),
      MODLOCK_MAIL_TRANSPORT: "outbox",
      MODLOCK_OUTBOX_DIRECTORY: mail,
    });
    let created = false,
      server: ReturnType<typeof spawn> | undefined,
      logs = "";
    let stage = "database setup";
    const cookies = new Map<string, string>();
    async function request(
      path: string,
      body?: unknown,
      authenticated = true,
      headers: Record<string, string> = {},
    ) {
      const response = await fetch(new URL(path, origin), {
        method: body === undefined ? "GET" : "POST",
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        headers: {
          origin,
          "content-type": "application/json",
          ...(authenticated
            ? { cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; ") }
            : {}),
          ...headers,
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (authenticated)
        for (const cookie of response.headers.getSetCookie()) {
          const first = cookie.split(";", 1)[0],
            index = first.indexOf("="),
            key = first.slice(0, index),
            value = first.slice(index + 1);
          if (/max-age=0(?:;|$)/i.test(cookie) || !value) cookies.delete(key);
          else cookies.set(key, value);
        }
      return response;
    }
    try {
      await admin.query(`CREATE DATABASE "${name}"`);
      created = true;
      await (await getMigrations(accountAuthOptions())).runMigrations();
      for (const file of (await readdir("migrations"))
        .filter((n) => /^\d{4}-.*\.sql$/.test(n))
        .sort())
        await getDatabase().query(
          await readFile(join("migrations", file), "utf8"),
        );
      stage = "server startup";
      server = spawn(
        process.execPath,
        [
          "node_modules/next/dist/bin/next",
          "start",
          "--hostname",
          "127.0.0.1",
          "--port",
          String(port),
        ],
        { env: process.env, stdio: ["ignore", "pipe", "pipe"] },
      );
      server.stdout?.on("data", (v) => {
        logs = (logs + String(v)).slice(-4000);
      });
      server.stderr?.on("data", (v) => {
        logs = (logs + String(v)).slice(-4000);
      });
      let ready = false;
      for (let i = 0; i < 60; i++) {
        if (server.exitCode !== null)
          throw new Error("Built test server exited before startup.");
        try {
          if (
            (await request("/api/auth/get-session", undefined, false))
              .status === 200
          ) {
            ready = true;
            break;
          }
        } catch {}
        await delay(100);
      }
      assert.equal(ready, true, "Built server did not become ready");
      stage = "anonymous page checks";
      const denied = await request("/account", undefined, false);
      assert.equal(denied.status, 307);
      assert.match(denied.headers.get("location") ?? "", /^\/sign-in/);
      assert.equal(
        (await request("/account/export", undefined, false)).status,
        401,
      );
      for (const path of [
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/tools",
        "/tools/crosshair",
        "/tools/keyvalues",
        "/tools/vpk",
        "/creators",
        "/help",
        "/privacy",
        "/status",
      ]) {
        const response = await request(path, undefined, false);
        assert.equal(response.status, 200, `${path} should load`);
        const html = await response.text();
        assert.match(html, /<main/);
      }
      const email = "transport@modlock.test",
        password = "Synthetic-built-server-password!";
      stage = "sign-up and verification";
      assert.equal(
        (
          await request("/api/auth/sign-up/email", {
            email,
            password,
            name: "Transport fixture",
            callbackURL: "/account",
          })
        ).status,
        200,
      );
      assert.equal(await (await request("/api/auth/get-session")).json(), null);
      const filename = (await readdir(mail)).find((n) => n.endsWith(".json"))!,
        message = JSON.parse(await readFile(join(mail, filename), "utf8"));
      assert.equal(message.to, email);
      const verification = await request(message.url);
      assert.ok([200, 302].includes(verification.status));
      const issued = verification.headers
        .getSetCookie()
        .find((v) => v.startsWith("modlock.session_token="));
      assert.ok(issued);
      assert.match(issued, /HttpOnly/i);
      assert.match(issued, /SameSite=Lax/i);
      const profile = await request("/account");
      assert.equal(profile.status, 200);
      assert.match(await profile.text(), /Transport fixture/);
      const member = (await (await request("/api/auth/get-session")).json())
        .user.id;
      await getDatabase().query(
        `INSERT INTO mod_report(id,reporter_id,mod_key,reason,detail,request_key)
        SELECT gen_random_uuid(),$1,'mod-'||n,'other','Synthetic export history fixture',gen_random_uuid() FROM generate_series(1,101) n`,
        [member],
      );
      await getDatabase().query(
        "INSERT INTO saved_mod(user_id,mod_key,note) VALUES($1,'mod-123','Synthetic private export note')",
        [member],
      );
      await getDatabase().query(
        "INSERT INTO saved_crosshair(id,user_id,name,document) VALUES(gen_random_uuid(),$1,'Export fixture',$2)",
        [
          member,
          JSON.stringify({
            contract: "modlock.crosshair-design",
            schema_version: 1,
            gameValidated: false,
            design: {
              length: 10,
              thickness: 2,
              gap: 6,
              dot: 2,
              opacity: 100,
              outline: true,
              color: "#a8dfb1",
            },
          }),
        ],
      );
      const exportResponse = await request("/account/export");
      stage = "account export";
      assert.equal(exportResponse.status, 200);
      assert.equal(
        exportResponse.headers.get("cache-control"),
        "private, no-store",
      );
      assert.match(
        exportResponse.headers.get("content-disposition") ?? "",
        /attachment/,
      );
      const exported = await exportResponse.json();
      validatePersonalData(exported);
      assert.equal(exported.account.email, email);
      assert.equal(JSON.stringify(exported).includes(password), false);
      assert.equal(exported.profile.public, false);
      assert.equal(
        exported.reports.length,
        101,
        "Export must include reports beyond the UI's 100-row history",
      );
      assert.equal(exported.savedMods[0].note, "Synthetic private export note");
      assert.equal(exported.crosshairs.length, 1);
      stage = "staff isolation and session revocation";
      assert.equal((await request("/moderation")).status, 404);
      assert.equal(
        (
          await request("/api/auth/update-user", { name: "CSRF" }, true, {
            origin: "https://attacker.invalid",
          })
        ).status,
        403,
      );
      assert.equal((await request("/api/auth/sign-out", {})).status, 200);
      assert.equal((await request("/account/export")).status, 401);
      assert.equal(
        (await request("/api/auth/sign-in/email", { email, password })).status,
        200,
      );
      assert.equal(
        (await request("/api/auth/delete-user", { password })).status,
        200,
      );
      assert.equal(await (await request("/api/auth/get-session")).json(), null);
      assert.equal(
        /TypeError|ReferenceError|Unhandled/.test(logs),
        false,
        "Built server emitted a runtime error",
      );
      stage = "completed";
    } catch (error) {
      t.diagnostic(`HTTP test failed at: ${stage}`);
      throw error;
    } finally {
      if (server && server.exitCode === null) {
        server.kill("SIGTERM");
        await Promise.race([
          new Promise<void>((resolve) => server!.once("exit", () => resolve())),
          delay(3000),
        ]);
        if (server.exitCode === null) server.kill("SIGKILL");
      }
      await getDatabase().end();
      if (created) await dropTestDatabase(admin, name);
      await admin.end();
      await rm(mail, { recursive: true, force: true });
    }
  },
);
