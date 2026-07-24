import { NextResponse, type NextRequest } from "next/server";

import { verifyCookieValue } from "@/core/auth/cookie-sign";
import { buildSessionCookies, decodeJwtExpiry, SESSION_COOKIE_NAMES } from "@/core/auth/session";
import { serverEnv } from "@/core/config/env";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|login|registrar|baixar).*)",
  ],
};

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE_NAMES.access);
  response.cookies.delete(SESSION_COOKIE_NAMES.refresh);
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const rawAccess = request.cookies.get(SESSION_COOKIE_NAMES.access)?.value;
  const rawRefresh = request.cookies.get(SESSION_COOKIE_NAMES.refresh)?.value;

  const [accessToken, refreshToken] = await Promise.all([
    rawAccess ? verifyCookieValue(rawAccess) : Promise.resolve(null),
    rawRefresh ? verifyCookieValue(rawRefresh) : Promise.resolve(null),
  ]);

  if (!accessToken || !refreshToken) {
    return redirectToLogin(request);
  }

  const exp = decodeJwtExpiry(accessToken);
  const nowSeconds = Date.now() / 1000;
  const expiringSoon = exp === null || exp - nowSeconds < 60;

  if (!expiringSoon) {
    return NextResponse.next();
  }

  try {
    const refreshResponse = await fetch(`${serverEnv.API_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!refreshResponse.ok) throw new Error("refresh failed");
    const data = (await refreshResponse.json()) as { accessToken: string; refreshToken: string };

    const response = NextResponse.next();
    const sessionCookies = await buildSessionCookies(data.accessToken, data.refreshToken);
    for (const cookie of sessionCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    return response;
  } catch {
    return redirectToLogin(request);
  }
}
