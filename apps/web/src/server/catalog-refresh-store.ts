import type { PoolClient } from "pg";
import type { Catalog } from "../lib/gamebanana.ts";
import { validateCatalog } from "../lib/catalog-refresh.ts";
import type {
  ProfileCheckpoint,
  RefreshStore,
} from "../lib/catalog-refresh.ts";

// Hold this session lock for the complete run, including publication. A dead
// worker loses the lock automatically; a competing cron invocation exits.
export const CATALOG_REFRESH_LOCK = 86731503;
export class DatabaseRefreshStore implements RefreshStore {
  private client: PoolClient;
  constructor(client: PoolClient) {
    this.client = client;
  }
  async catalog(): Promise<Catalog | null> {
    const result = await this.client.query<{ document: Catalog }>(
      "SELECT document FROM catalog_snapshot WHERE singleton=true",
    );
    return result.rows[0]?.document ?? null;
  }
  async profiles(activeKeys: string[]): Promise<ProfileCheckpoint[]> {
    const result = await this.client.query<{ document: ProfileCheckpoint }>(
      "SELECT document FROM catalog_profile_checkpoint WHERE key=ANY($1::text[]) ORDER BY key LIMIT 10001",
      [activeKeys],
    );
    if (result.rowCount! > 10000)
      throw new Error("Profile checkpoint budget exceeded.");
    return result.rows.map((row) => row.document);
  }
  async checkpoint(profile: ProfileCheckpoint): Promise<void> {
    await this.client.query(
      `INSERT INTO catalog_profile_checkpoint(key,document) VALUES($1,$2::jsonb)
      ON CONFLICT(key) DO UPDATE SET document=excluded.document,updated_at=now()`,
      [profile.key, JSON.stringify(profile)],
    );
  }
  async publish(catalog: Catalog, activeKeys: string[]): Promise<void> {
    validateCatalog(catalog);
    await this.client.query("BEGIN");
    try {
      await this.client.query(
        `INSERT INTO catalog_snapshot(singleton,document) VALUES(true,$1::jsonb)
        ON CONFLICT(singleton) DO UPDATE SET document=excluded.document,published_at=now()`,
        [JSON.stringify(catalog)],
      );
      await this.client.query(
        "DELETE FROM catalog_profile_checkpoint WHERE NOT (key=ANY($1::text[]))",
        [activeKeys],
      );
      await this.client.query("COMMIT");
    } catch (error) {
      await this.client.query("ROLLBACK");
      throw error;
    }
  }
}
