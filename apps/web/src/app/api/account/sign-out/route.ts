import { sharedAccount } from "@/server/shared-account";
import { privateHeaders } from "@buildlock/portfolio-auth-client";
export async function POST(request: Request) {
  try {
    const client = sharedAccount();
    if (!client.requestAllowed(request) || request.headers.get("origin") !== client.origin)
      return Response.json({ error: "Reload this page before signing out." }, { status: 403, headers: privateHeaders });
    return Response.json({ ok: true }, { headers: { ...privateHeaders, "Set-Cookie": await client.signOut(request) } });
  } catch { return Response.json({ error: "Could not sign out. Reload and try again." }, { status: 503, headers: privateHeaders }); }
}
