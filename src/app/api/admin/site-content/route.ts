import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { getSiteContent, updateSiteContent } from "@/lib/site-content/store";
import type { SiteContent } from "@/lib/site-content/types";

export async function GET() {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar contenido del sitio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const body = (await request.json()) as SiteContent;
    const content = await updateSiteContent(body);
    return NextResponse.json(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar contenido del sitio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
