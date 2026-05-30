"use client";

import { useMemo, useState } from "react";
import type { OpenWaQrCode, OpenWaSession } from "@/lib/admin/types";
import { notify } from "@/lib/toast";
import { syncActiveSessionToServer } from "@/lib/whatsapp/sync-active-session-client";

type SessionsPanelProps = {
  isLoading: boolean;
  onCreateSession: (name: string) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onLoadQrCode: (sessionId: string) => Promise<OpenWaQrCode | null>;
  onSelectSession: (sessionId: string) => void;
  onStartSession: (sessionId: string) => Promise<void>;
  onStopSession: (sessionId: string) => Promise<void>;
  selectedSessionId?: string | null;
  sessions: OpenWaSession[];
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function needsSessionStart(status: OpenWaSession["status"]) {
  return status === "created" || status === "disconnected" || status === "failed";
}

function isQrPendingError(message: string) {
  return message.includes("no está listo") || message.includes("not ready") || message.includes("no está iniciada") || message.includes("not started");
}

function statusTone(status: OpenWaSession["status"]) {
  switch (status) {
    case "ready":
      return "bg-green-50 text-green-700";
    case "qr_ready":
    case "authenticating":
    case "initializing":
      return "bg-yellow-50 text-yellow-700";
    case "failed":
      return "bg-red-50 text-red-700";
    default:
      return "bg-surface-container-low text-on-surface-variant";
  }
}

export function SessionsPanel({
  isLoading,
  onCreateSession,
  onDeleteSession,
  onLoadQrCode,
  onSelectSession,
  onStartSession,
  onStopSession,
  selectedSessionId,
  sessions,
}: SessionsPanelProps) {
  const [sessionName, setSessionName] = useState("");
  const [qrCode, setQrCode] = useState<OpenWaQrCode | null>(null);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions],
  );

  async function handleCreateSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionName.trim()) {
      notify.warning("Escribe un nombre para la nueva sesión.");
      return;
    }

    try {
      await onCreateSession(sessionName.trim());
      setSessionName("");
      notify.success("Sesión creada correctamente.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible crear la sesión.");
    }
  }

  async function loadQrWithRetry(sessionId: string) {
    const maxAttempts = 12;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const nextQrCode = await onLoadQrCode(sessionId);

        if (nextQrCode?.qrCode) {
          return nextQrCode;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";

        if (!isQrPendingError(message) || attempt === maxAttempts - 1) {
          throw error;
        }
      }

      await sleep(2500);
    }

    throw new Error("El código QR no estuvo listo a tiempo. Intenta de nuevo.");
  }

function isStartIgnorableError(message: string) {
  return message.includes("ya está iniciada") || message.includes("already started");
}

  async function ensureSessionRunning(sessionId: string, status?: OpenWaSession["status"]) {
    if (status === "failed" || status === "disconnected") {
      try {
        await onStopSession(sessionId);
      } catch {
        // La sesión puede estar detenida parcialmente tras un fallo de Chromium.
      }
    }

    if (!status || needsSessionStart(status)) {
      try {
        await onStartSession(sessionId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";

        if (!isStartIgnorableError(message)) {
          throw error;
        }
      }
    }
  }

  async function handleQrRequest(sessionId: string) {
    setBusySessionId(sessionId);
    setQrCode(null);

    const session = sessions.find((item) => item.id === sessionId);

    try {
      notify.info("Iniciando sesión para generar el QR...");
      await ensureSessionRunning(sessionId, session?.status);

      const nextQrCode = await loadQrWithRetry(sessionId);
      setQrCode(nextQrCode);
      onSelectSession(sessionId);
      try {
        await syncActiveSessionToServer(sessionId);
      } catch {
        // Se volverá a sincronizar cuando la sesión pase a «ready».
      }
      notify.success("Código QR listo. Escanéalo con WhatsApp.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible obtener el QR.");
    } finally {
      setBusySessionId(null);
    }
  }

  async function runAction(sessionId: string, action: "start" | "stop" | "delete") {
    setBusySessionId(sessionId);

    try {
      if (action === "start") {
        await onStartSession(sessionId);
      }

      if (action === "stop") {
        await onStopSession(sessionId);
      }

      if (action === "delete") {
        await onDeleteSession(sessionId);
      }

      notify.success("Acción ejecutada correctamente.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible ejecutar la acción.");
    } finally {
      setBusySessionId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-primary">Sesiones</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Crea, inicia y administra todas las sesiones de OpenWA desde aquí.</p>
        </div>

        <form className="mb-6 flex flex-col gap-3 md:flex-row" onSubmit={handleCreateSession}>
          <input
            type="text"
            value={sessionName}
            onChange={(event) => setSessionName(event.target.value)}
            placeholder="Nombre de la nueva sesión"
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">
            Crear sesión
          </button>
        </form>

        <div className="space-y-4">
          {sessions.length ? (
            sessions.map((session) => {
              const isBusy = busySessionId === session.id;
              const isSelected = session.id === selectedSessionId;

              return (
                <div
                  key={session.id}
                  className={`rounded-[1.5rem] border p-4 transition ${
                    isSelected ? "border-primary bg-blue-50" : "border-outline-variant/15 bg-surface-container-lowest"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <button type="button" onClick={() => onSelectSession(session.id)} className="min-w-0 text-left">
                      <p className="truncate font-semibold text-primary">{session.name}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">{session.phone || session.id}</p>
                    </button>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(session.status)}`}>{session.status}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => runAction(session.id, "start")}
                      disabled={isBusy}
                      className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Iniciar
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction(session.id, "stop")}
                      disabled={isBusy}
                      className="rounded-full bg-surface-container-high px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60"
                    >
                      Detener
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQrRequest(session.id)}
                      disabled={isBusy}
                      className="rounded-full bg-secondary-container px-3 py-2 text-xs font-semibold text-primary disabled:opacity-60"
                    >
                      Ver QR
                    </button>
                    <button
                      type="button"
                      onClick={() => runAction(session.id, "delete")}
                      disabled={isBusy}
                      className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
              {isLoading ? "Cargando sesiones..." : "Todavía no hay sesiones creadas."}
            </div>
          )}
        </div>
      </article>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-primary">Sesión activa</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Selecciona una sesión para usarla en inbox, grupos, contactos y webhooks.</p>
        </div>

        {selectedSession ? (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] bg-surface-container-low p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-primary">{selectedSession.name}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{selectedSession.phone || "Sin teléfono vinculado todavía"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(selectedSession.status)}`}>{selectedSession.status}</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant/60">Conectada</p>
                  <p className="mt-2 text-sm font-medium text-primary">{selectedSession.connectedAt ? new Date(selectedSession.connectedAt).toLocaleString("es-CO") : "Aún no"}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant/60">Última actividad</p>
                  <p className="mt-2 text-sm font-medium text-primary">{selectedSession.lastActive ? new Date(selectedSession.lastActive).toLocaleString("es-CO") : "Sin actividad"}</p>
                </div>
              </div>
            </div>

            {qrCode ? (
              <div className="rounded-[1.5rem] border border-outline-variant/15 bg-surface-container-low p-6 text-center">
                <p className="mb-4 text-sm text-on-surface-variant">Escanea este QR con la app de WhatsApp.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode.qrCode} alt="Código QR de OpenWA" className="mx-auto h-64 w-64 rounded-2xl bg-white p-3" />
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-surface-container-low p-6 text-sm text-on-surface-variant">
                Pulsa <span className="font-semibold text-primary">Ver QR</span> para iniciar la sesión y mostrar el código de autenticación aquí.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-surface-container-low p-6 text-sm text-on-surface-variant">
            Elige una sesión para ver su estado, QR y detalles de conexión.
          </div>
        )}
      </article>
    </div>
  );
}
