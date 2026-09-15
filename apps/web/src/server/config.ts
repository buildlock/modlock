import { resolve, isAbsolute } from "node:path";

export interface AccountConfig {
  enabled: boolean;
  mode: "disabled" | "local" | "shared";
  origin: string;
  databaseUrl: string;
  secret: string;
  mailDirectory: string;
}

export function readAccountConfig(
  env: Record<string, string | undefined> = process.env,
): AccountConfig {
  const mode = env.MODLOCK_ACCOUNT_MODE === "shared" ? "shared" : env.MODLOCK_LOCAL_ACCOUNTS === "1" ? "local" : "disabled";
  const enabled = mode !== "disabled";
  const origin = (mode === "shared" ? env.MODLOCK_ORIGIN : env.BETTER_AUTH_URL) || "http://127.0.0.1:4310";
  const base = new URL(origin);
  if (
    !/^https?:$/.test(base.protocol) ||
    base.origin !== origin ||
    base.username ||
    base.password
  )
    throw new Error("The account URL must be an exact HTTP(S) origin.");
  const databaseUrl = env.DATABASE_URL || "";
  const secret = env.BETTER_AUTH_SECRET || "";
  if (env.MODLOCK_OUTBOX_DIRECTORY && !isAbsolute(env.MODLOCK_OUTBOX_DIRECTORY))
    throw new Error("The test outbox override must be an absolute local path.");
  if (mode === "local") {
    if (!["127.0.0.1", "localhost", "[::1]"].includes(base.hostname))
      throw new Error(
        "Local accounts may only run on a loopback origin.",
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
  if (mode === "shared") {
    if (env.MODLOCK_LOCAL_ACCOUNTS === "1") throw new Error("Choose one account mode.");
    if (base.protocol !== "https:" && !(env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)))
      throw new Error("Shared accounts require HTTPS.");
    const database = new URL(databaseUrl);
    if (!["postgres:", "postgresql:"].includes(database.protocol) ||
        !(["localhost", "127.0.0.1", "[::1]"].includes(database.hostname) || database.hostname.endsWith(".railway.internal")))
      throw new Error("Use Modlock's private product database.");
    if (!/^[A-Za-z0-9_-]{43}$/.test(env.PORTFOLIO_CLIENT_SECRET || "")) throw new Error("The shared sign-in client credential is missing.");
  }
  return {
    enabled,
    mode,
    origin,
    databaseUrl,
    secret,
    mailDirectory:
      env.MODLOCK_OUTBOX_DIRECTORY || resolve(process.cwd(), "data/mail"),
  };
}
