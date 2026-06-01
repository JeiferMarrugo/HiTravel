import { NextResponse } from "next/server";
import { clearSessionCookieOnResponse } from "@/lib/auth/session";
import { safeRedirectUrl } from "@/lib/http/request-url";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const prefersJson = contentType.includes("application/json");

  const response = prefersJson
    ? NextResponse.json({ message: "Sesión cerrada correctamente." })
    : NextResponse.redirect(safeRedirectUrl(request, "/admin/login"), 303);

  clearSessionCookieOnResponse(response, request);
  return response;
}
