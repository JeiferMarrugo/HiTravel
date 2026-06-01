export async function readAdminFormBody<T = Record<string, unknown>>(
  request: Request,
): Promise<{ body: T; prefersJson: boolean }> {
  const contentType = request.headers.get("content-type") ?? "";
  const prefersJson = contentType.includes("application/json");

  if (prefersJson) {
    return {
      body: (await request.json()) as T,
      prefersJson: true,
    };
  }

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const payload = form.get("payload")?.toString();

    if (!payload) {
      throw new Error("Falta el payload del formulario.");
    }

    return {
      body: JSON.parse(payload) as T,
      prefersJson: false,
    };
  }

  throw new Error("Formato de solicitud no soportado.");
}
