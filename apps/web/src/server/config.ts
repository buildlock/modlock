import { resolve, isAbsolute } from "node:path";

export interface AccountConfig {
  enabled: boolean;
  origin: string;
  databaseUrl: string;
  secret: string;
  mailDirectory: string;
}

export function readAccountConfig(
  env: Record<string, string | undefined> = process.env,
): AccountConfig {
  const enabled = env.MODLOCK_LOCAL_ACCOUNTS === "1";
  const origin = env.BETTER_AUTH_URL || "http://127.0.0.1:4310";
  const base = new URL(origin);
  if (
    !/^https?:$/.test(base.protocol) ||
    base.origin !== origin ||
    base.username ||
    base.password
  )
    throw new Error("BETTER_AUTH_URL must be an exact HTTP(S) origin.");
  const databaseUrl = env.DATABASE_URL || "";
  const secret = env.BETTER_AUTH_SECRET || "";
  if (env.MODLOCK_OUTBOX_DIRECTORY && !isAbsolute(env.MODLOCK_OUTBOX_DIRECTORY))
    throw new Error("The test outbox override must be an absolute local path.");
  if (enabled) {
    if (!["127.0.0.1", "localhost", "[::1]"].includes(base.hostname))
      throw new Error(
        "Local accounts may only run on a loopback origin. Deployment is on hold.",
      );
    const database = new URL(databaseUrl);
    if (
      !["postgres:", "postgresql:"].includes(database.protocol) ||
      !["127.0.0.1", "localhost", "[::1]"].includes(database.hostname)
    )
      throw new Error(
        "Local accounts require a dedicated local PostgreSQL database.",
      );
    if (secret.length < 32)
      throw new Error("A private random authentication secret is required.");
    if (env.MODLOCK_MAIL_TRANSPORT !== "outbox")
      throw new Error("This local build requires the development mail outbox.");
  }
  return {
    enabled,
    origin,
    databaseUrl,
    secret,
    mailDirectory:
      env.MODLOCK_OUTBOX_DIRECTORY || resolve(process.cwd(), "data/mail"),
  };
}
