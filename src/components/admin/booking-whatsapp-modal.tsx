"use client";

import { useCallback, useEffect, useState } from "react";
import type { WhatsAppMessageLogEntry } from "@/lib/whatsapp/booking-notifications";
import { WHATSAPP_TEMPLATE_OPTIONS, whatsappTemplateLabel } from "@/lib/whatsapp/template-labels";
import type { WhatsAppTemplateKey } from "@/lib/whatsapp/types";
import { notify } from "@/lib/toast";

type BookingWhatsAppModalProps = {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
};

function formatLogDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingWhatsAppModal({
  bookingId,
  bookingCode,
  customerName,
  isOpen,
  onClose,
  onSent,
}: BookingWhatsAppModalProps) {
  const [logs, setLogs] = useState<WhatsAppMessageLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [templateKey, setTemplateKey] = useState<WhatsAppTemplateKey>("booking_confirmed");
  const [forceResend, setForceResend] = useState(false);
  const [maxSendAttempts, setMaxSendAttempts] = useState(3);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/whatsapp`, { cache: "no-store" });
      const payload = (await response.json()) as {
        logs?: WhatsAppMessageLogEntry[];
        maxSendAttempts?: number;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo cargar el historial.");
      }
      const nextLogs = payload.logs ?? [];
      const max = payload.maxSendAttempts ?? 3;
      setLogs(nextLogs);
      setMaxSendAttempts(max);
      const logForTemplate = nextLogs.find((entry) => entry.templateKey === templateKey);
      setForceResend(
        logForTemplate?.status === "failed" ||
          Boolean(logForTemplate && logForTemplate.sendAttempts >= max),
      );
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar historial.");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, templateKey]);

  useEffect(() => {
    if (isOpen) {
      void loadLogs();
    }
  }, [isOpen, loadLogs]);

  async function handleSend() {
    setIsSending(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey, forceResend }),
      });
      const payload = (await response.json()) as {
        sent?: boolean;
        skipped?: boolean;
        reason?: string;
        error?: string;
        attempts?: number;
        logs?: WhatsAppMessageLogEntry[];
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo enviar el mensaje.");
      }

      if (payload.logs) {
        setLogs(payload.logs);
      } else {
        await loadLogs();
      }

      if (payload.sent) {
        notify.success("Mensaje enviado por WhatsApp.");
        onSent?.();
      } else if (payload.skipped) {
        notify.info(payload.reason ?? "Envío omitido.");
      } else {
        notify.error(payload.error ?? "No se pudo enviar el mensaje.");
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al enviar.");
    } finally {
      setIsSending(false);
    }
  }

  function handleTemplateChange(key: WhatsAppTemplateKey) {
    setTemplateKey(key);
    const log = logs.find((entry) => entry.templateKey === key);
    const limitReached = Boolean(log && log.sendAttempts >= maxSendAttempts);
    setForceResend(log?.status === "failed" || limitReached);
  }

  if (!isOpen) {
    return null;
  }

  const selectedLog = logs.find((entry) => entry.templateKey === templateKey);
  const atAttemptLimit = Boolean(selectedLog && selectedLog.sendAttempts >= maxSendAttempts);
  const showForceResend = Boolean(selectedLog);
  const forceResendLabel =
    selectedLog?.status === "sent"
      ? "Reenviar aunque ya se haya enviado correctamente"
      : "Forzar reenvío (ignora el límite de intentos)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-labelledby="whatsapp-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] bg-white p-6 coastal-shadow"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="whatsapp-modal-title" className="text-lg font-semibold text-primary">
              Enviar WhatsApp
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {bookingCode} · {customerName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
          >
            Cerrar
          </button>
        </div>

        <p className="mb-3 text-sm font-medium text-primary">¿Qué mensaje quieres enviar?</p>
        <div className="mb-4 space-y-2">
          {WHATSAPP_TEMPLATE_OPTIONS.map((option) => {
            const log = logs.find((entry) => entry.templateKey === option.key);
            return (
              <label
                key={option.key}
                className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 ${
                  templateKey === option.key
                    ? "border-primary bg-secondary-container/40"
                    : "border-outline-variant/20"
                }`}
              >
                <input
                  type="radio"
                  name="whatsapp-template"
                  checked={templateKey === option.key}
                  onChange={() => handleTemplateChange(option.key)}
                  className="mt-1 accent-primary"
                />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-primary">{option.label}</span>
                  <span className="block text-xs text-on-surface-variant">{option.description}</span>
                  {log ? (
                    <span className="mt-1 block text-xs text-on-surface-variant">
                      {log.status === "sent" ? "Enviado" : "Falló"} · {log.sendAttempts} intento
                      {log.sendAttempts === 1 ? "" : "s"} · {formatLogDate(log.sentAt)}
                      {log.errorMessage ? ` · ${log.errorMessage}` : ""}
                    </span>
                  ) : (
                    <span className="mt-1 block text-xs text-on-surface-variant">Sin envíos aún</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>

        {showForceResend ? (
          <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={forceResend}
              onChange={(event) => setForceResend(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-amber-950">
              <span className="font-semibold">{forceResendLabel}</span>
              {atAttemptLimit && !forceResend ? (
                <span className="mt-1 block text-xs">
                  Llegaste al máximo de {maxSendAttempts} intentos. Marca esta casilla para volver a
                  enviar.
                </span>
              ) : null}
            </span>
          </label>
        ) : null}

        {isLoading ? (
          <p className="mb-4 text-xs text-on-surface-variant">Cargando historial...</p>
        ) : logs.length ? (
          <div className="mb-4 rounded-xl bg-surface-container-low p-3 text-xs text-on-surface-variant">
            <p className="font-semibold text-primary">Historial de envíos</p>
            <ul className="mt-2 space-y-1">
              {logs.map((entry, index) => (
                <li key={`${entry.templateKey}-${entry.sentAt}-${index}`}>
                  {whatsappTemplateLabel(entry.templateKey)} — {entry.status === "sent" ? "OK" : "Error"} (
                  {entry.sendAttempts} intentos) — {formatLogDate(entry.sentAt)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm font-semibold text-on-surface-variant"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSending}
            onClick={() => void handleSend()}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSending ? "Enviando..." : forceResend && showForceResend ? "Reenviar WhatsApp" : "Enviar WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
