import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { storeUploadedFile } from "@/lib/uploads/store-file";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder")?.toString() ?? "tours").replace(/[^a-z0-9-_]/gi, "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Debes enviar un archivo." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Formato no permitido. Usa JPG, PNG, WebP o GIF." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "El archivo supera el límite de 8 MB." }, { status: 400 });
    }

    const url = await storeUploadedFile(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible subir el archivo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
