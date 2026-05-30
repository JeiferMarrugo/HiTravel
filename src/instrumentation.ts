export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (process.env.OPENWA_AUTO_START !== "true") {
    return;
  }

  const sessionId = process.env.OPENWA_SESSION_ID?.trim();
  if (!sessionId) {
    console.warn("[openwa-watchdog] OPENWA_AUTO_START está activo pero falta OPENWA_SESSION_ID.");
    return;
  }

  const { ensureOpenWaSession } = await import("@/lib/openwa-watchdog");

  void ensureOpenWaSession()
    .then((result) => {
      console.info(`[openwa-watchdog] ${result.message}`);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error(`[openwa-watchdog] No fue posible iniciar la sesión: ${message}`);
    });
}
