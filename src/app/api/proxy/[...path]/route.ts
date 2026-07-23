import { NextResponse, type NextRequest } from "next/server";

import { authApi } from "@/core/api/resources";
import { apiFetch } from "@/core/api/server-client";
import { ApiRequestError } from "@/core/api/errors";
import { clearSession, getSession, writeSession } from "@/core/auth/session";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, path: string[]): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ code: "AUTH_INVALID_TOKEN", message: "Sem sessão." }, { status: 401 });
  }

  const targetPath = `/v1/${path.join("/")}`;
  const search = request.nextUrl.search;
  const method = request.method as "GET" | "POST" | "PATCH" | "DELETE";
  const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;
  const body = method === "GET" || method === "DELETE" ? undefined : await request.json().catch(() => undefined);

  async function call(accessToken: string) {
    const url = new URL(`${targetPath}${search}`, "http://internal");
    return apiFetch<unknown>(`${url.pathname}${url.search}`, {
      method,
      accessToken,
      ...(idempotencyKey ? { idempotencyKey } : {}),
      ...(body !== undefined ? { body } : {}),
    });
  }

  try {
    const data = await call(session.accessToken);
    return data === undefined ? new NextResponse(null, { status: 204 }) : NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      try {
        const refreshed = await authApi.refresh(session.refreshToken);
        await writeSession(refreshed.accessToken, refreshed.refreshToken);
        const data = await call(refreshed.accessToken);
        return data === undefined ? new NextResponse(null, { status: 204 }) : NextResponse.json(data);
      } catch {
        await clearSession();
        return NextResponse.json(
          { code: "AUTH_INVALID_TOKEN", message: "Sessão expirada. Entre novamente." },
          { status: 401 },
        );
      }
    }
    if (error instanceof ApiRequestError) {
      return NextResponse.json(
        { code: error.code, message: error.message, fieldErrors: error.fieldErrors },
        { status: error.status || 502 },
      );
    }
    return NextResponse.json({ code: "UNKNOWN", message: "Algo deu errado." }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: RouteParams) {
  const { path } = await context.params;
  return forward(request, path);
}
export async function POST(request: NextRequest, context: RouteParams) {
  const { path } = await context.params;
  return forward(request, path);
}
export async function PATCH(request: NextRequest, context: RouteParams) {
  const { path } = await context.params;
  return forward(request, path);
}
export async function DELETE(request: NextRequest, context: RouteParams) {
  const { path } = await context.params;
  return forward(request, path);
}
