import { readAccountConfig } from "@/server/config";
import { getDatabase } from "@/server/database";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const config = readAccountConfig();
    if (config.mode === "shared") {
      const result = await getDatabase().query("SELECT count(*)::int AS count FROM modlock_migration WHERE name IN ('shared-identity-v1','shared-handle-reuse-v1')");
      if (result.rows[0]?.count !== 2) throw new Error("Storage is not ready.");
    }
    return Response.json({ status: "ok", service: "modlock", accounts: config.mode }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ status: "unavailable", service: "modlock" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
