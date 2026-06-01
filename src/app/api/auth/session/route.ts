import { NextResponse } from "next/server";
import {
  clearSessionCookieOnResponse,
  getSessionFromCookies,
  getSessionCookieOptions,
  isSessionExpired,
  refreshSessionToken,
  toSessionUser,
} from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export async function GET(request: Request) {
  const session = await getSessionFromCookies();

  if (!session || isSessionExpired(session)) {
    const response = NextResponse.json({ error: "Sesión expirada." }, { status: 401 });
    clearSessionCookieOnResponse(response, request);
    return response;
  }

  return NextResponse.json({ user: toSessionUser(session) });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();

  if (!session || isSessionExpired(session)) {
    const response = NextResponse.json({ error: "Sesión expirada." }, { status: 401 });
    clearSessionCookieOnResponse(response, request);
    return response;
  }

  const token = await refreshSessionToken(session);
  const response = NextResponse.json({ user: toSessionUser(session), message: "Sesión renovada." });
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(request));
  return response;
}
