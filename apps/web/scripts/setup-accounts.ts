import { randomBytes } from "node:crypto";
import { open, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

await mkdir(resolve("data/mail"), { recursive: true, mode: 0o700 });
try {
  const file = await open(resolve(".env.local"), "wx", 0o600);
  const password = randomBytes(32).toString("hex");
  try {
    await file.writeFile(
      [
        "MODLOCK_LOCAL_ACCOUNTS=1",
        `MODLOCK_DB_PASSWORD=${password}`,
        `DATABASE_URL=postgresql://modlock:${password}@127.0.0.1:54339/modlock`,
        `BETTER_AUTH_SECRET=${randomBytes(48).toString("base64url")}`,
        "BETTER_AUTH_URL=http://127.0.0.1:4310",
        "MODLOCK_MAIL_TRANSPORT=outbox",
        "",
      ].join("\n"),
    );
  } finally {
    await file.close();
  }
  console.log(
    "Created private local account configuration. No credentials were printed.",
  );
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  console.log(
    "Existing .env.local preserved. Check the web runbook for required account settings.",
  );
}
