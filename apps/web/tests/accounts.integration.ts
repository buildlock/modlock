import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Pool } from "pg";
import { getMigrations } from "better-auth/db/migration";
import { accountAuthOptions } from "../src/server/auth.ts";
import { accountHandler } from "../src/server/auth-http.ts";
import { getDatabase } from "../src/server/database.ts";
import { dropTestDatabase } from "./helpers/local-database.ts";
import {
  getMemberProfile,
  updateProfile,
  publicMember,
  saveMod,
  savedMods,
  saveModNote,
  submitReport,
  reportsForMember,
  restrictions,
} from "../src/server/community.ts";
import {
  savedCrosshairs,
  saveCrosshair,
  removeCrosshair,
} from "../src/server/crosshairs.ts";
import { defaultCrosshair, crosshairDocument } from "../src/lib/crosshair.ts";
import {
  requireStaff,
  reviewReport,
  moderationQueue,
} from "../src/server/moderation.ts";

try {
  process.loadEnvFile(".env.local");
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
const adminUrl = new URL(process.env.DATABASE_URL ?? "");
if (!["127.0.0.1", "localhost", "[::1]"].includes(adminUrl.hostname))
  throw new Error("Account tests require a local PostgreSQL server.");
const databaseName = `modlock_test_${randomBytes(12).toString("hex")}`;
const admin = new Pool({ connectionString: adminUrl.href, max: 1 });
const mail = await mkdtemp(join(tmpdir(), "modlock-test-mail-"));
const origin = "http://127.0.0.1:4310",
  password = "Disposable-test-password-2026!",
  newPassword = "Changed-disposable-password-2026!";
adminUrl.pathname = `/${databaseName}`;
Object.assign(process.env, {
  DATABASE_URL: adminUrl.href,
  MODLOCK_LOCAL_ACCOUNTS: "1",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: randomBytes(48).toString("hex"),
  MODLOCK_MAIL_TRANSPORT: "outbox",
  MODLOCK_OUTBOX_DIRECTORY: mail,
});

class Client {
  cookies = new Map<string, string>();
  lastCookies: string[] = [];
  async request(
    path: string,
    body?: unknown,
    overrides: Record<string, string> = {},
  ) {
    const headers = new Headers({
      origin,
      "content-type": "application/json",
      cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "),
      ...overrides,
    });
    const response = await accountHandler(
      new Request(
        path.startsWith("http") ? path : `${origin}/api/auth${path}`,
        {
          method: body === undefined ? "GET" : "POST",
          headers,
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        },
      ),
    );
    this.lastCookies = response.headers.getSetCookie();
    for (const cookie of this.lastCookies) {
      const first = cookie.split(";", 1)[0],
        i = first.indexOf("="),
        key = first.slice(0, i),
        value = first.slice(i + 1);
      if (/max-age=0(?:;|$)/i.test(cookie) || !value) this.cookies.delete(key);
      else this.cookies.set(key, value);
    }
    return response;
  }
  async session() {
    return (await this.request("/get-session")).json();
  }
}
async function outbox(email: string, purpose: string) {
  const files = (await readdir(mail)).sort().reverse();
  for (const file of files) {
    const value = JSON.parse(await readFile(join(mail, file), "utf8"));
    if (value.to === email && value.purpose === purpose)
      return value.url as string;
  }
  throw new Error("Expected local account message was not written.");
}
async function register(client: Client, email: string) {
  const result = await client.request("/sign-up/email", {
    email,
    password,
    name: "Synthetic member",
    role: "administrator",
    emailVerified: true,
    callbackURL: "/account",
  });
  assert.equal(result.status, 200);
  assert.equal(await client.session(), null);
  return (await result.json()).user.id as string;
}
async function verify(client: Client, email: string) {
  const response = await client.request(await outbox(email, "verify"));
  assert.ok([200, 302].includes(response.status));
  assert.equal((await client.session())?.user.emailVerified, true);
}
function totp(uri: string) {
  const secret = new URL(uri).searchParams.get("secret")!,
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secret.toUpperCase().replace(/=+$/, ""))
    bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  const key = Buffer.from(
      (bits.match(/.{8}/g) ?? []).map((v) => parseInt(v, 2)),
    ),
    counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac("sha1", key).update(counter).digest(),
    offset = digest[19] & 15;
  return String(
    (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000,
  ).padStart(6, "0");
}

test(
  "local account and community security integration",
  { timeout: 120_000 },
  async (t) => {
    let created = false;
    try {
      await admin.query(`CREATE DATABASE "${databaseName}"`);
      created = true;
      await (await getMigrations(accountAuthOptions())).runMigrations();
      for (const name of (await readdir("migrations"))
        .filter((n) => /^\d{4}-.*\.sql$/.test(n))
        .sort())
        await getDatabase().query(
          await readFile(join("migrations", name), "utf8"),
        );
      const alice = new Client(),
        bob = new Client();
      let aliceId = "",
        bobId = "",
        reportId = "";
      await t.test(
        "sign-up stays unverified; caller fields cannot grant identity or a role",
        async () => {
          aliceId = await register(alice, "alice@modlock.test");
          bobId = await register(bob, "bob@modlock.test");
          assert.equal(
            (
              await alice.request("/sign-in/email", {
                email: "alice@modlock.test",
                password,
              })
            ).status,
            403,
          );
          assert.equal(
            (
              await getDatabase().query(
                "SELECT count(*)::int AS n FROM staff_grant",
              )
            ).rows[0].n,
            0,
          );
          await verify(alice, "alice@modlock.test");
          await verify(bob, "bob@modlock.test");
          assert.equal((await bob.request("/delete-user", {})).status, 400);
          assert.ok(await bob.session());
          assert.ok(alice.cookies.has("modlock.session_token"));
        },
      );
      await t.test(
        "auth rejects cross-origin, non-JSON and actual oversized bodies",
        async () => {
          assert.equal(
            (
              await alice.request(
                "/update-user",
                { name: "bad" },
                { origin: "https://attacker.invalid" },
              )
            ).status,
            403,
          );
          assert.equal(
            (
              await alice.request(
                "/update-user",
                { name: "bad" },
                { origin: "" },
              )
            ).status,
            403,
          );
          assert.equal(
            (
              await alice.request(
                "/update-user",
                { name: "bad" },
                { host: "attacker.invalid" },
              )
            ).status,
            403,
          );
          const internalUrlResponse = await accountHandler(
            new Request("http://localhost:4310/api/auth/get-session", {
              headers: { host: "127.0.0.1:4310" },
            }),
          );
          assert.equal(internalUrlResponse.status, 200);
          assert.equal(
            (
              await alice.request(
                "/update-user",
                { name: "bad" },
                { "content-type": "text/plain" },
              )
            ).status,
            415,
          );
          assert.equal(
            (await alice.request("/update-user", { name: "x".repeat(17000) }))
              .status,
            413,
          );
          assert.equal(
            (
              await alice.request("/update-user", { name: "valid name" })
            ).headers.get("cache-control"),
            "private, no-store",
          );
          assert.equal(
            (
              await alice.request("/send-verification-email", {
                email: "alice@modlock.test",
                callbackURL: "https://attacker.invalid",
              })
            ).status,
            403,
          );
        },
      );
      await t.test(
        "a consumed verification link cannot open another signed-in session",
        async () => {
          const replay = new Client();
          await replay.request(await outbox("bob@modlock.test", "verify"));
          assert.equal(await replay.session(), null);
        },
      );
      await t.test(
        "private profiles require opt-in; handles and links are bounded",
        async () => {
          const profile = await getMemberProfile(aliceId);
          assert.equal(profile.is_public, false);
          assert.equal(await publicMember(profile.handle), null);
          await updateProfile(aliceId, {
            handle: "alice_preview",
            bio: "Public bio",
            website: "https://example.com",
            isPublic: true,
          });
          const publicData = await publicMember("alice_preview");
          assert.deepEqual(Object.keys(publicData!).sort(), [
            "bio",
            "handle",
            "name",
            "website",
          ]);
          await assert.rejects(() =>
            updateProfile(bobId, {
              handle: "admin",
              bio: "",
              website: "",
              isPublic: true,
            }),
          );
          await assert.rejects(() =>
            updateProfile(bobId, {
              handle: "bob_preview",
              bio: "",
              website: "javascript:alert(1)",
              isPublic: true,
            }),
          );
          await assert.rejects(() =>
            updateProfile(bobId, {
              handle: "alice_preview",
              bio: "",
              website: "",
              isPublic: true,
            }),
          );
        },
      );
      await t.test(
        "saved mods and private notes are isolated and idempotent",
        async () => {
          await Promise.all(
            Array.from({ length: 4 }, () =>
              saveMod(aliceId, "mod-123", true, "2026-01-01T00:00:00Z"),
            ),
          );
          assert.equal((await savedMods(aliceId)).length, 1);
          assert.equal((await savedMods(bobId)).length, 0);
          await assert.rejects(() =>
            saveModNote(bobId, "mod-123", "Other member cannot change this"),
          );
          await saveModNote(aliceId, "mod-123", "My private note");
          await saveMod(bobId, "mod-123", false, null);
          assert.equal((await savedMods(aliceId))[0].note, "My private note");
        },
      );
      await t.test(
        "reports deduplicate retries and remain reporter-scoped",
        async () => {
          const report = {
            key: "mod-123",
            reason: "broken" as const,
            detail: "A synthetic report for isolation testing",
            requestKey: randomUUID(),
          };
          const ids = await Promise.all(
            Array.from({ length: 5 }, () => submitReport(aliceId, report)),
          );
          assert.equal(new Set(ids).size, 1);
          reportId = ids[0];
          assert.equal(
            await submitReport(aliceId, {
              ...report,
              requestKey: randomUUID(),
            }),
            reportId,
          );
          assert.equal((await reportsForMember(bobId)).length, 0);
          for (let i = 0; i < 4; i++)
            await submitReport(aliceId, {
              ...report,
              key: `mod-${200 + i}`,
              requestKey: randomUUID(),
            });
          await assert.rejects(
            () =>
              submitReport(aliceId, {
                ...report,
                key: "mod-999",
                requestKey: randomUUID(),
              }),
            /Too many/,
          );
          const session = (await alice.session()).session;
          await assert.rejects(() => requireStaff(aliceId, session.id));
        },
      );
      await t.test(
        "crosshair contract rejects injected or out-of-range fields and enforces ownership",
        async () => {
          const id = await saveCrosshair(
            aliceId,
            "Daily design",
            crosshairDocument(defaultCrosshair),
          );
          await removeCrosshair(bobId, id);
          assert.equal((await savedCrosshairs(aliceId)).length, 1);
          assert.equal((await savedCrosshairs(bobId)).length, 0);
          await assert.rejects(() =>
            saveCrosshair(aliceId, "bad", {
              ...crosshairDocument(defaultCrosshair),
              commands: "exec bad.cfg",
            }),
          );
          await assert.rejects(() =>
            saveCrosshair(aliceId, "bad", {
              ...crosshairDocument(defaultCrosshair),
              design: { ...defaultCrosshair, length: 500 },
            }),
          );
        },
      );
      await t.test(
        "password change revokes other sessions and uses the current password",
        async () => {
          const other = new Client();
          assert.equal(
            (
              await other.request("/sign-in/email", {
                email: "alice@modlock.test",
                password,
              })
            ).status,
            200,
          );
          assert.equal(
            (
              await alice.request("/change-password", {
                currentPassword: "Incorrect-old-password",
                newPassword,
                revokeOtherSessions: true,
              })
            ).status,
            400,
          );
          assert.equal(
            (
              await alice.request("/change-password", {
                currentPassword: password,
                newPassword,
                revokeOtherSessions: true,
              })
            ).status,
            200,
          );
          assert.equal(await other.session(), null);
          assert.ok(await alice.session());
        },
      );
      await t.test(
        "recovery token is single-use and revokes previous sessions",
        async () => {
          assert.equal(
            (
              await alice.request("/request-password-reset", {
                email: "alice@modlock.test",
                redirectTo: "/reset-password",
              })
            ).status,
            200,
          );
          const link = await outbox("alice@modlock.test", "reset");
          const redirect = await new Client().request(link),
            location = redirect.headers.get("location")!;
          const token = new URL(location, origin).searchParams.get("token")!;
          assert.ok(token);
          const recovery = new Client();
          assert.equal(
            (
              await recovery.request("/reset-password", {
                token,
                newPassword: password,
              })
            ).status,
            200,
          );
          assert.equal(
            (await recovery.request("/reset-password", { token, newPassword }))
              .status,
            400,
          );
          assert.equal(await alice.session(), null);
          assert.equal(
            (
              await alice.request("/sign-in/email", {
                email: "alice@modlock.test",
                password,
              })
            ).status,
            200,
          );
        },
      );
      await t.test(
        "TOTP and backup code challenges gate login; backup codes cannot replay",
        async () => {
          const enabled = await alice.request("/two-factor/enable", {
            password,
            method: "totp",
          });
          assert.equal(enabled.status, 200);
          const setup = await enabled.json();
          assert.equal(
            (
              await alice.request("/two-factor/verify-totp", {
                code: totp(setup.totpURI),
              })
            ).status,
            200,
          );
          await alice.request("/sign-out", {});
          const signin = await alice.request("/sign-in/email", {
            email: "alice@modlock.test",
            password,
          });
          assert.equal(signin.status, 200);
          assert.equal((await signin.json()).twoFactorRedirect, true);
          assert.equal(await alice.session(), null);
          assert.equal(
            (
              await alice.request("/two-factor/verify-backup-code", {
                code: setup.backupCodes[0],
              })
            ).status,
            200,
          );
          assert.ok(await alice.session());
          const replay = new Client();
          await replay.request("/sign-in/email", {
            email: "alice@modlock.test",
            password,
          });
          assert.equal(
            (
              await replay.request("/two-factor/verify-backup-code", {
                code: setup.backupCodes[0],
              })
            ).status,
            401,
          );
          assert.equal(await replay.session(), null);
        },
      );
      await t.test(
        "moderation enforces role, MFA, freshness, stale-write protection and auditing",
        async () => {
          const aliceSession = (await alice.session()).session,
            bobSession = (await bob.session()).session;
          await assert.rejects(() => moderationQueue(bobId, bobSession.id, 1));
          await getDatabase().query(
            "INSERT INTO staff_grant(user_id,role) VALUES($1,'moderator'),($2,'moderator')",
            [aliceId, bobId],
          );
          await assert.rejects(() => requireStaff(bobId, bobSession.id));
          const report = (await reportsForMember(aliceId)).find(
            (r) => r.id === reportId,
          )!;
          const decision = {
            id: reportId,
            status: "reviewing" as const,
            response: "Synthetic review; temporarily hidden for testing",
            visibility: "hide" as const,
            expectedUpdatedAt: report.updated_at.toISOString(),
          };
          await reviewReport(aliceId, aliceSession.id, decision);
          assert.ok((await restrictions()).has("mod-123"));
          await assert.rejects(
            () => reviewReport(aliceId, aliceSession.id, decision),
            /changed/,
          );
          const refreshed = (await reportsForMember(aliceId)).find(
            (r) => r.id === reportId,
          )!;
          await reviewReport(aliceId, aliceSession.id, {
            ...decision,
            status: "resolved",
            visibility: "restore",
            expectedUpdatedAt: refreshed.updated_at.toISOString(),
          });
          assert.equal((await restrictions()).size, 0);
          assert.equal(
            (
              await getDatabase().query(
                "SELECT count(*)::int AS n FROM moderation_event WHERE report_id=$1",
                [reportId],
              )
            ).rows[0].n,
            2,
          );
          await getDatabase().query(
            "UPDATE session SET \"createdAt\"=now()-interval '10 minutes' WHERE id=$1",
            [aliceSession.id],
          );
          await assert.rejects(
            () => requireStaff(aliceId, aliceSession.id, true),
            /Sign out/,
          );
        },
      );
      await t.test(
        "deletion cascades private records and removes the reporter link",
        async () => {
          assert.equal(
            (await alice.request("/delete-user", { password })).status,
            200,
          );
          assert.equal(await alice.session(), null);
          assert.equal(await publicMember("alice_preview"), null);
          assert.equal((await savedMods(aliceId)).length, 0);
          assert.equal((await savedCrosshairs(aliceId)).length, 0);
          assert.equal(
            (
              await getDatabase().query(
                "SELECT reporter_id FROM mod_report WHERE id=$1",
                [reportId],
              )
            ).rows[0].reporter_id,
            null,
          );
          assert.equal((await reportsForMember(bobId)).length, 0);
        },
      );
      await t.test(
        "repeated failed logins hit the database-backed rate limit",
        async () => {
          const attacker = new Client();
          let limited = false;
          for (let i = 0; i < 10; i++) {
            const response = await attacker.request("/sign-in/email", {
              email: "nobody@modlock.test",
              password: "Incorrect-disposable-password",
            });
            if (response.status === 429) {
              limited = true;
              break;
            }
          }
          assert.equal(limited, true);
          assert.equal(await attacker.session(), null);
        },
      );
    } finally {
      await getDatabase().end();
      if (created) await dropTestDatabase(admin, databaseName);
      await admin.end();
      await rm(mail, { recursive: true, force: true });
    }
  },
);
