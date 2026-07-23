/**
 * Fetch do browser — só fala com `/api/proxy/*` deste app, nunca com a URL da
 * API (guardrail §10.3). O Route Handler injeta o Bearer a partir do cookie.
 */
import { toApiRequestError } from "./errors";

type Query = Record<string, string | number | boolean | undefined | null>;

interface ProxyFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  idempotencyKey?: string;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(path, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function proxyFetch<T>(path: string, opts: ProxyFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  if (opts.idempotencyKey) headers["idempotency-key"] = opts.idempotencyKey;

  const response = await fetch(buildUrl(`/api/proxy${path}`, opts.query), {
    method: opts.method ?? "GET",
    headers,
    credentials: "same-origin",
    ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
  });

  if (!response.ok) {
    const error = await toApiRequestError(response);
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw error;
  }
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
