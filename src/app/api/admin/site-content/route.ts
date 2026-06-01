import { NextResponse } from "next/server";
import { readAdminFormBody } from "@/lib/admin/read-admin-form-body";
import { respondAdminFormSave } from "@/lib/admin/respond-admin-form-save";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { getSiteContent, updateSiteContent } from "@/lib/site-content/store";
import type { SiteContent } from "@/lib/site-content/types";

async function saveSiteContent(request: Request) {
  const { body, prefersJson } = await readAdminFormBody<SiteContent>(request);
  const content = await updateSiteContent(body);
  return respondAdminFormSave(request, "/admin/configuracion?saved=site", content, prefersJson);
}

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
    return await saveSiteContent(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar contenido del sitio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PUT(request);
}
