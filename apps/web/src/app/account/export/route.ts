import { currentSession } from "@/server/session";
import {
  getMemberProfile,
  savedMods,
  reportsForMember,
} from "@/server/community";
import { savedCrosshairs } from "@/server/crosshairs";
import { validatePersonalData } from "@/lib/personal-data";
export const dynamic = "force-dynamic";
export async function GET() {
  const session = await currentSession();
  if (!session?.user.verified)
    return Response.json(
      { error: "Sign in to export your account." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  const [profile, mods, reports, crosshairs] = await Promise.all([
    getMemberProfile(session.user.id),
    savedMods(session.user.id),
    reportsForMember(session.user.id, 1000),
    savedCrosshairs(session.user.id),
  ]);
  return Response.json(
    validatePersonalData(
      JSON.parse(
        JSON.stringify({
          format: "modlock-personal-data",
          version: 1,
          exportedAt: new Date().toISOString(),
          account: {
            name: session.user.name,
            email: session.user.email,
            createdAt: session.user.createdAt,
          },
          profile: {
            handle: profile.handle,
            bio: profile.bio,
            website: profile.website,
            public: profile.is_public,
          },
          savedMods: mods,
          reports,
          crosshairs,
        }),
      ),
    ),
    {
      headers: {
        "Content-Disposition": "attachment; filename=modlock-account.json",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
