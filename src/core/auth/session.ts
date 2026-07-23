import { cookies } from "next/headers";

import { signCookieValue, verifyCookieValue } from "./cookie-sign";

export const SESSION_COOKIE_NAMES = {
  access: "fluxo_at",
  refresh: "fluxo_rt",
} as const;

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
};

export interface SessionCookie {
  name: string;
  value: string;
  options: typeof baseCookieOptions & { maxAge: number };
}

/** Monta os cookies assinados de acesso e refresh prontos para gravação. */
export async function buildSessionCookies(
  accessToken: string,
  refreshToken: string,
): Promise<SessionCookie[]> {
  const [signedAccess, signedRefresh] = await Promise.all([
    signCookieValue(accessToken),
    signCookieValue(refreshToken),
  ]);
  return [
    {
      name: SESSION_COOKIE_NAMES.access,
      value: signedAccess,
      options: { ...baseCookieOptions, maxAge: 60 * 60 * 24 * 30 },
    },
    {
      name: SESSION_COOKIE_NAMES.refresh,
      value: signedRefresh,
      options: { ...baseCookieOptions, maxAge: 60 * 60 * 24 * 30 },
    },
  ];
}

export function clearedSessionCookies(): SessionCookie[] {
  return [
    { name: SESSION_COOKIE_NAMES.access, value: "", options: { ...baseCookieOptions, maxAge: 0 } },
    { name: SESSION_COOKIE_NAMES.refresh, value: "", options: { ...baseCookieOptions, maxAge: 0 } },
  ];
}

export interface Session {
  accessToken: string;
  refreshToken: string;
}

/** Lê e valida a sessão a partir de um par de valores de cookie brutos. */
export async function readSessionFromRaw(
  rawAccess: string | undefined,
  rawRefresh: string | undefined,
): Promise<Session | null> {
  if (!rawAccess || !rawRefresh) return null;
  const [accessToken, refreshToken] = await Promise.all([
    verifyCookieValue(rawAccess),
    verifyCookieValue(rawRefresh),
  ]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

/** Sessão atual — uso em Server Components e Route Handlers (leitura). */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return readSessionFromRaw(
    store.get(SESSION_COOKIE_NAMES.access)?.value,
    store.get(SESSION_COOKIE_NAMES.refresh)?.value,
  );
}

/** Grava a sessão nos cookies — só chamável de Route Handler ou Server Action. */
export async function writeSession(accessToken: string, refreshToken: string): Promise<void> {
  const store = await cookies();
  const sessionCookies = await buildSessionCookies(accessToken, refreshToken);
  for (const cookie of sessionCookies) {
    store.set(cookie.name, cookie.value, cookie.options);
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  for (const cookie of clearedSessionCookies()) {
    store.set(cookie.name, cookie.value, cookie.options);
  }
}

/** Decodifica o `exp` (segundos) de um JWT sem verificar assinatura — só para saber se está perto de expirar. */
export function decodeJwtExpiry(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "="));
    const parsed = JSON.parse(json) as { exp?: number };
    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}
