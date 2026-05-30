import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { createIdType, deleteIdType, listIdTypes, setIdTypeActive } from "@/lib/catalog/id-types";

export async function GET() {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    return NextResponse.json({ idTypes: await listIdTypes() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar tipos de ID.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const kind = body.kind;

    if (kind === "create") {
      await createIdType(
        typeof body.code === "string" ? body.code : "",
        typeof body.name === "string" ? body.name : "",
      );
    } else if (kind === "toggle") {
      await setIdTypeActive(
        typeof body.id === "string" ? body.id : "",
        Boolean(body.isActive),
      );
    } else if (kind === "delete") {
      await deleteIdType(typeof body.id === "string" ? body.id : "");
    } else {
      throw new Error("Solicitud no válida.");
    }

    return NextResponse.json({ idTypes: await listIdTypes() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
