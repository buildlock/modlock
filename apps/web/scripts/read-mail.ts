import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { readAccountConfig } from "../src/server/config.ts";
try {
  process.loadEnvFile(".env.local");
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
const [email, purpose = "verify"] = process.argv.slice(2);
if (!email || !["verify", "reset"].includes(purpose))
  throw new Error(
    "Usage: accounts:mail <test-email> [verify|reset]. Prints the latest private local account link.",
  );
const config = readAccountConfig();
if (!config.enabled) throw new Error("Local accounts are not configured.");
let found = false;
for (const file of (await readdir(config.mailDirectory)).sort().reverse()) {
  if (!/^\d+-[0-9a-f-]+\.json$/.test(file)) continue;
  const message = JSON.parse(
    await readFile(join(config.mailDirectory, file), "utf8"),
  );
  if (message.to === email.toLowerCase() && message.purpose === purpose) {
    if (new URL(message.url).origin !== config.origin)
      throw new Error("Unexpected account link origin.");
    console.log(
      `Local ${purpose} message from ${message.createdAt}. Keep this link private.`,
    );
    console.log(message.url);
    found = true;
    break;
  }
}
if (!found) {
  console.log("No matching local message found.");
  process.exitCode = 1;
}
