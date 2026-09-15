import { sharedAccount } from "@/server/shared-account";
import { privateHeaders } from "@buildlock/portfolio-auth-client";
export async function GET(request: Request) {
  try { return sharedAccount().start(request, new URL(request.url).searchParams.get("next") || "/account"); }
  catch { return Response.json({ error: "Shared sign-in is temporarily unavailable." }, { status: 503, headers: privateHeaders }); }
}
