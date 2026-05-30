import { NextResponse } from "next/server";
import { clearSessionCookieOnResponse } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ message: "Sesión cerrada correctamente." });
  clearSessionCookieOnResponse(response);
  return response;
}
