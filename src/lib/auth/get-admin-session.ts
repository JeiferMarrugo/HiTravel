import { cookies, headers } from "next/headers";
import { getSessionFromCookies, verifySessionToken } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/types";

function extractBearerToken(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice(7).trim();
  return token || null;
}

/** Sesión admin desde cookie (navegador) o Authorization: Bearer (integraciones API). */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const headerList = await headers();
  const bearer = extractBearerToken(headerList.get("authorization"));
  if (bearer) {
    const session = await verifySessionToken(bearer);
    if (session) {
      return session;
    }
  }

  return getSessionFromCookies();
}

export function extractBearerFromRequest(request: Request): string | null {
  return extractBearerToken(request.headers.get("authorization"));
}
