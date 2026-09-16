import { setTimeout as delay } from "node:timers/promises";
import { fetchJson } from "./gamebanana.ts";

// These are our conservative bounds, not advertised GameBanana rate limits.
export function pacedProviderRequest(signal: AbortSignal) {
  let requests = 0;
  return async (url: URL): Promise<unknown> => {
    for (let attempt = 0; ; attempt++) {
      signal.throwIfAborted();
      if (++requests > 1000)
        throw new Error("Provider request budget exhausted.");
      await delay(attempt ? 3000 * attempt : 1050, undefined, { signal });
      try {
        return await fetchJson(url, fetch, signal);
      } catch (error) {
        signal.throwIfAborted();
        const failure = error as Error;
        if (
          attempt >= 2 ||
          (!/TimeoutError|AbortError|TypeError/.test(failure.name) &&
            !(
              failure instanceof SyntaxError &&
              /Unexpected end/.test(failure.message)
            ) &&
            !/HTTP (429|5\d\d)/.test(failure.message))
        )
          throw error;
      }
    }
  };
}
