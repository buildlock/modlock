export interface SharedProfile {
  issuer: string;
  session: { id: string; createdAt: string; expiresAt: string };
  user: { id: string; username: string; usernameDisplay: string; name: string; image: string | null;
    bio: string; email: string | null; emailVerified: boolean; verified: boolean; steamId: string | null; createdAt: string };
}
export interface PublicSharedProfile {
  id: string; username: string; usernameDisplay: string; displayName: string; avatarUrl: string | null; bio?: string;
}
export const privateHeaders: Record<string, string>;
export function safeReturnPath(value: unknown): string;
export function createPortfolioClient(config: {
  clientId: string; clientSecret: string; origin: string; issuer: string; production?: boolean;
  fetch?: typeof fetch; now?: () => number;
}): {
  origin: string; issuer: string; sessionCookie: string; pendingCookie: string;
  requestAllowed(request: Request): boolean;
  clearPending(): string; clearSession(): string;
  tokenFromRequest(request: Request): string | null;
  start(request: Request, returnTo?: string): Response;
  complete(request: Request): Promise<{ profile: SharedProfile; returnTo: string; cookies: string[] }>;
  current(request: Request): Promise<SharedProfile | null>;
  publicProfile(userId: string): Promise<PublicSharedProfile | null>;
  matches(request: Request, input: { action: "list" | "discover" | "check"; matchId?: string; proof?: string }): Promise<Record<string, unknown> | null>;
  signOut(request: Request): Promise<string>;
};
