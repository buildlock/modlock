import { getAuth } from "./auth.ts";
import { readAccountConfig } from "./config.ts";

export async function accountHandler(request: Request) {
  const config = readAccountConfig();
  if (config.mode !== "local")
    return Response.json(
      { message: config.mode === "shared" ? "Use shared sign-in to manage your account." : "Accounts are not configured for this preview." },
      { status: 503 },
    );
  const requestUrl = new URL(request.url),
    configuredUrl = new URL(config.origin);
  // Next.js can normalize its internal URL to localhost. Validate the incoming
  // Host, then give the auth library the single configured canonical origin.
  if (
    (request.headers.get("host") ?? requestUrl.host) !== configuredUrl.host ||
    !["127.0.0.1", "localhost", "[::1]"].includes(requestUrl.hostname)
  )
    return Response.json({ message: "Unrecognized origin." }, { status: 403 });
  if (
    request.method === "POST" &&
    request.headers.get("origin") !== config.origin
  )
    return Response.json({ message: "Unrecognized origin." }, { status: 403 });
  const length = Number(request.headers.get("content-length") || 0);
  if (!Number.isFinite(length) || length > 16_384)
    return Response.json({ message: "Request too large." }, { status: 413 });
  // Bound the actual body as well as the declared length before it reaches auth.
  if (request.method === "POST") {
    if (
      !(request.headers.get("content-type") || "").startsWith(
        "application/json",
      )
    )
      return Response.json({ message: "JSON is required." }, { status: 415 });
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 16_384)
            return Response.json(
              { message: "Request too large." },
              { status: 413 },
            );
          chunks.push(value);
        }
      } finally {
        await reader.cancel();
        reader.releaseLock();
      }
    }
    request = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: Buffer.concat(chunks),
    });
  }
  requestUrl.protocol = configuredUrl.protocol;
  requestUrl.host = configuredUrl.host;
  request = new Request(requestUrl, request);
  const response = await getAuth().handler(request);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
