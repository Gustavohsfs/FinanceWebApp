import "server-only";

import { serverEnv } from "@/core/config/env";

import { toApiRequestError } from "./errors";

type Query = Record<string, string | number | boolean | undefined | null>;

export interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  accessToken?: string;
  idempotencyKey?: string;
  cache?: RequestCache;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${serverEnv.API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Chamada server-to-server à API Nest. Nunca é invocada do browser — o
 * navegador só fala com Route Handlers deste app (padrão BFF, guardrail §10.3).
 */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`;
  if (opts.idempotencyKey) headers["idempotency-key"] = opts.idempotencyKey;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? "GET",
      headers,
      cache: opts.cache ?? "no-store",
      ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
    });
  } catch {
    const { ApiRequestError } = await import("./errors");
    throw new ApiRequestError({ status: 0, code: "NETWORK_ERROR" });
  }

  if (!response.ok) throw await toApiRequestError(response);
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
