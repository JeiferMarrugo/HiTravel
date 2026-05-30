import { NextResponse } from "next/server";
import { listIdTypes } from "@/lib/catalog/id-types";

export async function GET() {
  try {
    const idTypes = await listIdTypes(true);
    return NextResponse.json({ idTypes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar opciones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
