import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

const opaque = (value) => typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
const hash = (value) => createHash("sha256").update(value).digest();
const same = (a, b) => typeof a === "string" && typeof b === "string" && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export const privateHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "Pragma": "no-cache" };

export function safeReturnPath(value) {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/u.test(value)) return "/";
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid" || url.pathname.startsWith("//") || url.pathname.startsWith("/api/account/")) return "/";
    return url.pathname + url.search + url.hash;
  } catch { return "/"; }
}

function exactOrigin(value, production) {
  const url = new URL(value);
  const local = !production && url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.origin !== value || url.username || url.password || (!local && url.protocol !== "https:")) throw new Error("An exact HTTPS origin is required.");
  return value;
}

function cookieValue(header, name) {
  if (typeof header !== "string" || header.length > 16384) return null;
  const matches = header.split(";").map((part) => part.trim()).filter((part) => part.startsWith(`${name}=`));
  if (matches.length !== 1) return null;
  return matches[0].slice(name.length + 1);
}

/** No framework, database or browser storage. Products hold audience-bound
 * opaque access in a host-only HttpOnly cookie; only their server knows the
 * client credential needed to use it. Profile reads always reach the issuer. */
export function createPortfolioClient({ clientId, clientSecret, origin, issuer, production = true, fetch: fetcher = fetch, now = Date.now }) {
  if (!["modlock", "maplock"].includes(clientId) || !opaque(clientSecret)) throw new Error("Shared sign-in is not configured.");
  exactOrigin(origin, production); exactOrigin(issuer, production);
  const secure = origin.startsWith("https:");
  const prefix = `${secure ? "__Host-" : ""}${clientId}`;
  const sessionCookie = `${prefix}_account`, pendingCookie = `${prefix}_signin`;
  const callback = `${origin}/api/account/callback`;
  const key = hash(clientSecret), aad = Buffer.from(`${clientId}\n${origin}\n${issuer}`);
  const cookie = (name, value, maxAge) => `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
  const clearPending = () => cookie(pendingCookie, "", 0);
  const clearSession = () => cookie(sessionCookie, "", 0);
  const requestAllowed = (request) => request.headers.get("host") === new URL(origin).host;
  function seal(value) {
    const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key, iv);
    cipher.setAAD(aad);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
  }
  function unseal(value) {
    try {
      if (typeof value !== "string" || value.length > 5000 || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
      const bytes = Buffer.from(value, "base64url");
      if (bytes.length < 29) return null;
      const decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
      decipher.setAAD(aad); decipher.setAuthTag(bytes.subarray(12, 28));
      return JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8"));
    } catch { return null; }
  }
  async function remote(path, input) {
    const response = await fetcher(`${issuer}/api/auth/portfolio/${path}`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ clientId, clientSecret, ...input }),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401 || response.status === 403) { await response.body?.cancel(); return null; }
    if (!response.ok || !response.headers.get("content-type")?.startsWith("application/json")) {
      await response.body?.cancel(); throw new Error("Shared account is temporarily unavailable.");
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Shared account returned an empty response.");
    const chunks = []; let size = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 32768) throw new Error("Shared account response exceeded its limit.");
        chunks.push(value);
      }
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } finally { await reader.cancel(); reader.releaseLock(); }
  }
  function validateProfile(value) {
    if (!value || value.issuer !== issuer || !value.user || !value.session ||
        typeof value.user.id !== "string" || !/^[0-9a-f-]{36}$/i.test(value.user.id) ||
        typeof value.user.username !== "string" || value.user.username.length > 20 ||
        typeof value.user.name !== "string" || value.user.name.length > 200 || value.user.verified !== true ||
        !Number.isFinite(Date.parse(value.session.expiresAt)) || Date.parse(value.session.expiresAt) <= now()) return null;
    return value;
  }
  async function profileForToken(token) {
    if (!opaque(token)) return null;
    return validateProfile(await remote("profile", { token }));
  }
  return {
    origin, issuer, sessionCookie, pendingCookie, requestAllowed, clearPending, clearSession,
    tokenFromRequest(request) { return cookieValue(request.headers.get("cookie"), sessionCookie); },
    start(request, returnTo = "/") {
      if (!requestAllowed(request)) throw new Error("Invalid host.");
      const state = randomBytes(32).toString("base64url"), verifier = randomBytes(32).toString("base64url");
      const url = new URL(`${issuer}/api/auth/portfolio/authorize`);
      url.search = new URLSearchParams({ client_id: clientId, redirect_uri: callback, code_challenge: hash(verifier).toString("base64url"), code_challenge_method: "S256", state }).toString();
      return new Response(null, { status: 303, headers: { ...privateHeaders, Location: url.href,
        "Set-Cookie": cookie(pendingCookie, seal({ state, verifier, returnTo: safeReturnPath(returnTo), expiresAt: now() + 600000 }), 600),
      } });
    },
    async complete(request) {
      if (!requestAllowed(request)) throw new Error("Invalid host.");
      const params = new URL(request.url).searchParams;
      const pending = unseal(cookieValue(request.headers.get("cookie"), pendingCookie));
      if (["code", "state", "iss"].some((key) => params.getAll(key).length !== 1) ||
          [...params.keys()].some((key) => !["code", "state", "iss"].includes(key)) || !pending ||
          !opaque(pending.state) || !opaque(pending.verifier) || !opaque(params.get("code")) ||
          !same(params.get("state"), pending.state) || params.get("iss") !== issuer ||
          !Number.isFinite(pending.expiresAt) || pending.expiresAt <= now()) throw new Error("Sign-in expired. Start again.");
      const access = await remote("exchange", { code: params.get("code"), verifier: pending.verifier, redirectUri: callback });
      if (!access || access.issuer !== issuer || !opaque(access.token)) throw new Error("Sign-in expired. Start again.");
      const profile = await profileForToken(access.token);
      if (!profile) throw new Error("Complete your BuildLock account, then sign in again.");
      const maxAge = Math.min(604800, Math.floor((Date.parse(profile.session.expiresAt) - now()) / 1000));
      if (maxAge <= 0) throw new Error("Sign-in expired. Start again.");
      return { profile, returnTo: safeReturnPath(pending.returnTo), cookies: [clearPending(), cookie(sessionCookie, access.token, maxAge)] };
    },
    async current(request) {
      if (!requestAllowed(request)) return null;
      return profileForToken(cookieValue(request.headers.get("cookie"), sessionCookie));
    },
    async publicProfile(userId) {
      if (typeof userId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) return null;
      const result = await remote("public-profile", { userId });
      return result?.issuer === issuer && result?.profile?.id === userId ? result.profile : null;
    },
    async matches(request, input) {
      if (clientId !== "maplock" || !requestAllowed(request)) return null;
      const token = cookieValue(request.headers.get("cookie"), sessionCookie);
      if (!opaque(token)) return null;
      const result = await remote("matches", { token, action: input.action, matchId: input.matchId, proof: input.proof });
      return result?.issuer === issuer ? result : null;
    },
    async signOut(request) {
      if (!requestAllowed(request) || request.headers.get("origin") !== origin) throw new Error("Reload this page before signing out.");
      const token = cookieValue(request.headers.get("cookie"), sessionCookie);
      if (opaque(token)) await remote("sign-out", { token });
      return clearSession();
    },
  };
}
