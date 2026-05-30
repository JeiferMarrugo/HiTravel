import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/get-admin-session";
import { isSessionExpired } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/types";

export async function requireAdminSession(): Promise<SessionPayload | NextResponse> {
  const session = await getAdminSession();

  if (!session || isSessionExpired(session)) {
    return NextResponse.json({ error: "Sesión expirada o no autorizada." }, { status: 401 });
  }

  return session;
}

export function isSessionError(result: SessionPayload | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
