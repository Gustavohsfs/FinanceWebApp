import { NextResponse, type NextRequest } from "next/server";

import { authApi } from "@/core/api/resources";
import { ApiRequestError } from "@/core/api/errors";
import { clearSession, getSession, writeSession } from "@/core/auth/session";

export const runtime = "nodejs";

function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApiRequestError) {
    return NextResponse.json(
      { code: error.code, message: error.message, fieldErrors: error.fieldErrors },
      { status: error.status || 502 },
    );
  }
  return NextResponse.json({ code: "UNKNOWN", message: "Algo deu errado." }, { status: 500 });
}

async function handleLogin(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { email: string; password: string };
  const session = await authApi.login(body);
  await writeSession(session.accessToken, session.refreshToken);
  return NextResponse.json({ user: session.user });
}

async function handleRegister(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { email: string; password: string; name: string };
  const session = await authApi.register(body);
  await writeSession(session.accessToken, session.refreshToken);
  return NextResponse.json({ user: session.user });
}

async function handleRefresh(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ code: "AUTH_INVALID_TOKEN", message: "Sem sessão." }, { status: 401 });
  }
  const refreshed = await authApi.refresh(session.refreshToken);
  await writeSession(refreshed.accessToken, refreshed.refreshToken);
  return NextResponse.json({ user: refreshed.user });
}

async function handleLogout(): Promise<NextResponse> {
  const session = await getSession();
  if (session) {
    try {
      await authApi.logout(session.refreshToken);
    } catch {
      // sessão já pode estar revogada — segue para limpar os cookies mesmo assim
    }
  }
  await clearSession();
  return new NextResponse(null, { status: 204 });
}

async function handleMe(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ code: "AUTH_INVALID_TOKEN", message: "Sem sessão." }, { status: 401 });
  }
  const user = await authApi.me(session.accessToken);
  return NextResponse.json({ user });
}

async function handlePassword(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ code: "AUTH_INVALID_TOKEN", message: "Sem sessão." }, { status: 401 });
  }
  const body = (await request.json()) as { currentPassword: string; newPassword: string };
  await authApi.changePassword(session.accessToken, body);
  return new NextResponse(null, { status: 204 });
}

async function handleLogoutAll(): Promise<NextResponse> {
  const session = await getSession();
  if (session) {
    try {
      await authApi.logoutAll(session.accessToken);
    } catch {
      // segue para limpar os cookies mesmo se a chamada falhar
    }
  }
  await clearSession();
  return new NextResponse(null, { status: 204 });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string[] }> },
): Promise<NextResponse> {
  const { action } = await context.params;
  const route = action.join("/");
  try {
    switch (route) {
      case "login":
        return await handleLogin(request);
      case "register":
        return await handleRegister(request);
      case "refresh":
        return await handleRefresh();
      case "logout":
        return await handleLogout();
      case "logout-all":
        return await handleLogoutAll();
      case "password":
        return await handlePassword(request);
      default:
        return NextResponse.json({ code: "NOT_FOUND", message: "Rota inválida." }, { status: 404 });
    }
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ action: string[] }> },
): Promise<NextResponse> {
  const { action } = await context.params;
  const route = action.join("/");
  try {
    if (route === "me") return await handleMe();
    return NextResponse.json({ code: "NOT_FOUND", message: "Rota inválida." }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}
