import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, SESSION_TIMEOUT_MS } from "@/lib/auth/constants";
import type { SessionPayload, SessionUser } from "@/lib/auth/types";

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("Falta configurar SESSION_SECRET (mínimo 32 caracteres).");
  }
  return new TextEncoder().encode(secret);
}

export function isSessionExpired(payload: SessionPayload, now = Date.now()): boolean {
  return now - payload.lastActivity > SESSION_TIMEOUT_MS;
}

export function toSessionUser(payload: SessionPayload): SessionUser {
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    lastActivity: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    const name = typeof payload.name === "string" ? payload.name : "";
    const role = typeof payload.role === "string" ? payload.role : "";
    const lastActivity = typeof payload.lastActivity === "number" ? payload.lastActivity : 0;

    if (!sub || !email || !name || !role || !lastActivity) {
      return null;
    }

    const session: SessionPayload = { sub, email, name, role, lastActivity };

    if (isSessionExpired(session)) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function refreshSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
    lastActivity: Date.now(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function setSessionCookieOnResponse(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export function clearSessionCookieOnResponse(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  const session = await getSessionFromCookies();
  return session ? toSessionUser(session) : null;
}
