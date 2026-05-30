import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { getActiveCatalogOptions } from "@/lib/catalog/catalog-options";

export async function GET() {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    return NextResponse.json(await getActiveCatalogOptions());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar opciones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
