import { sharedAccount, syncSharedProfile } from "@/server/shared-account";
import { privateHeaders } from "@buildlock/portfolio-auth-client";
export async function GET(request: Request) {
  let client: ReturnType<typeof sharedAccount>;
  try { client = sharedAccount(); }
  catch { return Response.json({ error: "Shared sign-in is temporarily unavailable." }, { status: 503, headers: privateHeaders }); }
  try {
    const result = await client.complete(request);
    await syncSharedProfile(result.profile);
    const response = new Response(null, { status: 303, headers: { ...privateHeaders, Location: client.origin + result.returnTo } });
    for (const cookie of result.cookies) response.headers.append("Set-Cookie", cookie);
    return response;
  } catch {
    return new Response(null, { status: 303, headers: { ...privateHeaders,
      Location: `${client.origin}/sign-in?error=shared_sign_in_failed`, "Set-Cookie": client.clearPending(),
    } });
  }
}
