import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { readAccountConfig } from "./config.ts";

export async function deliverAccountMail(input: {
  to: string;
  purpose: "verify" | "reset";
  url: string;
}) {
  const config = readAccountConfig();
  if (!config.enabled) throw new Error("Accounts are unavailable.");
  if (new URL(input.url).origin !== config.origin)
    throw new Error("Refusing an account link for another origin.");
  await mkdir(config.mailDirectory, { recursive: true, mode: 0o700 });
  await writeFile(
    join(config.mailDirectory, `${Date.now()}-${randomUUID()}.json`),
    JSON.stringify({
      ...input,
      createdAt: new Date().toISOString(),
      transport: "local-development-outbox",
    }) + "\n",
    { mode: 0o600, flag: "wx" },
  );
}
