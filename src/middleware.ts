import { NextResponse, type NextRequest } from "next/server";
import {
  clearSessionCookieOnResponse,
  isSessionExpired,
  refreshSessionToken,
  setSessionCookieOnResponse,
  verifySessionToken,
} from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

const PROTECTED_API_PREFIXES = [
  "/api/openwa",
  "/api/whatsapp/send",
  "/api/whatsapp/contact",
  "/api/admin",
];

function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isProtectedAdminPath(pathname: string) {
  return pathname.startsWith("/admin") && !isPublicAdminPath(pathname);
}

function isProtectedApiPath(pathname: string) {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const bearer = request.headers.get("authorization");
  const token =
    request.cookies.get(SESSION_COOKIE_NAME)?.value ??
    (bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : undefined);

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (isPublicAdminPath(pathname)) {
    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
    return NextResponse.next();
  }

  if (!isProtectedAdminPath(pathname) && !isProtectedApiPath(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    if (isProtectedApiPath(pathname)) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);

  if (!session || isSessionExpired(session)) {
    if (isProtectedApiPath(pathname)) {
      const response = NextResponse.json({ error: "Sesión expirada." }, { status: 401 });
      clearSessionCookieOnResponse(response);
      return response;
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("expired", "1");
    const response = NextResponse.redirect(loginUrl);
    clearSessionCookieOnResponse(response);
    return response;
  }

  if (isProtectedAdminPath(pathname)) {
    const response = NextResponse.next();
    const refreshedToken = await refreshSessionToken(session);
    await setSessionCookieOnResponse(response, refreshedToken);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/openwa/:path*",
    "/api/whatsapp/send",
    "/api/whatsapp/contact",
    "/api/admin/:path*",
  ],
};
