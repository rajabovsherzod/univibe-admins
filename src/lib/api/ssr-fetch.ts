// lib/api/ssr-fetch.ts
// Server-side (Server Component) authenticated fetch with automatic retry on
// TRANSIENT failures. In dev the OneDrive-mounted backend can drop a single
// request mid-refresh (a momentary 404/5xx or a dropped socket); a couple of
// quick retries paper over that so a transient blip never surfaces as a page
// crash. Definitive answers are NOT retried:
//   • ok / 2xx        → returned immediately (success)
//   • 401 / 403       → returned immediately (auth — caller redirects / shows
//                        the ForbiddenState; retrying can't change the answer)
// Only 404, 5xx and network errors are treated as transient and retried.

interface SsrFetchOptions {
  /** Extra retry attempts after the first try. Default 2 (so up to 3 tries). */
  retries?: number;
  /** Base backoff between attempts in ms (grows linearly). Default 250. */
  retryDelayMs?: number;
  headers?: Record<string, string>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function ssrFetch(
  url: string,
  token: string,
  options: SsrFetchOptions = {}
): Promise<Response> {
  const { retries = 2, retryDelayMs = 250, headers } = options;

  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...headers,
        },
        cache: "no-store",
      });

      // Success or a definitive auth verdict — return without retrying.
      if (res.ok || res.status === 401 || res.status === 403) {
        return res;
      }

      // Transient server/routing hiccup (404, 5xx) — remember and retry.
      lastResponse = res;
    } catch (err) {
      // Network-level failure (dropped socket, DNS blip) — retry.
      lastError = err;
    }

    if (attempt < retries) {
      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  // Exhausted retries: hand back the last transient response so the caller can
  // report a precise status, or rethrow the last network error.
  if (lastResponse) return lastResponse;
  throw lastError ?? new Error("Network request failed");
}
