import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

function fileExtension(mimeType: string) {
  return mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
}

export async function storeUploadedFile(file: File, folder: string) {
  const extension = fileExtension(file.type);
  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    const blob = await put(`${folder}/${filename}`, buffer, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}
