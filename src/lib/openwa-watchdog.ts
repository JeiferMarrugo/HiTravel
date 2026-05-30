import { listSessions, startSession } from "@/lib/openwa";
import type { OpenWaSession, OpenWaSessionStatus } from "@/lib/admin/types";

const RESTARTABLE_STATUSES: OpenWaSessionStatus[] = ["disconnected", "failed", "created"];

export type OpenWaWatchdogResult = {
  action: "started" | "already_ready" | "waiting_auth" | "missing_session" | "skipped";
  message: string;
  session?: OpenWaSession | null;
};

function readConfiguredSessionId() {
  return process.env.OPENWA_SESSION_ID?.trim() || null;
}

function isAutoStartEnabled() {
  return process.env.OPENWA_AUTO_START === "true";
}

export function isWatchdogEnabled() {
  return isAutoStartEnabled() && Boolean(readConfiguredSessionId());
}

export async function ensureOpenWaSession(): Promise<OpenWaWatchdogResult> {
  const sessionId = readConfiguredSessionId();

  if (!sessionId) {
    return {
      action: "skipped",
      message: "Falta configurar OPENWA_SESSION_ID.",
    };
  }

  if (!isAutoStartEnabled()) {
    return {
      action: "skipped",
      message: "OPENWA_AUTO_START no está habilitado.",
    };
  }

  const sessions = await listSessions();
  const session = sessions.find((item) => item.id === sessionId) ?? null;

  if (!session) {
    return {
      action: "missing_session",
      message: `No se encontró la sesión ${sessionId} en OpenWA.`,
      session: null,
    };
  }

  if (session.status === "ready") {
    return {
      action: "already_ready",
      message: `La sesión ${session.name} ya está conectada.`,
      session,
    };
  }

  if (["initializing", "qr_ready", "authenticating"].includes(session.status)) {
    return {
      action: "waiting_auth",
      message: `La sesión ${session.name} está en proceso de conexión (${session.status}).`,
      session,
    };
  }

  if (!RESTARTABLE_STATUSES.includes(session.status)) {
    return {
      action: "skipped",
      message: `La sesión ${session.name} está en estado ${session.status} y no se reinició automáticamente.`,
      session,
    };
  }

  const restarted = await startSession(sessionId);

  return {
    action: "started",
    message: `Se inició automáticamente la sesión ${restarted.name}.`,
    session: restarted,
  };
}

export function isValidWatchdogSecret(request: Request) {
  const expected = process.env.OPENWA_WATCHDOG_SECRET?.trim();
  if (!expected) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  if (authorization === `Bearer ${expected}`) {
    return true;
  }

  const url = new URL(request.url);
  return url.searchParams.get("secret") === expected;
}
