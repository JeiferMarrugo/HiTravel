/** Guarda en PostgreSQL la sesión usada para mensajes automáticos de reservas. */
export async function syncActiveSessionToServer(sessionId: string): Promise<void> {
  const response = await fetch("/api/admin/whatsapp-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings: { activeSessionId: sessionId } }),
  });

  if (!response.ok) {
    const payload = (await response.json()) as { error?: string };
    throw new Error(payload.error ?? "No se pudo guardar la sesión activa.");
  }
}
