import type { Pool } from "pg";
import { setTimeout as delay } from "node:timers/promises";
export async function dropTestDatabase(admin: Pool, name: string) {
  if (!/^modlock_(?:test|http)_[0-9a-f]{24}$/.test(name))
    throw new Error(
      "Refusing to remove a database outside the disposable test namespace.",
    );
  // Pool.end can resolve while PostgreSQL is still closing the sockets. Wait
  // for normal disconnects instead of forcibly terminating live connections.
  for (let attempt = 0; ; attempt++) {
    try {
      await admin.query(`DROP DATABASE "${name}"`);
      return;
    } catch (error) {
      if ((error as { code?: string }).code !== "55006" || attempt >= 20)
        throw error;
      await delay(100);
    }
  }
}
