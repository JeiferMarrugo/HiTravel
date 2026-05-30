"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { OpenWaSession } from "@/lib/admin/types";
import { listOpenWaSessions } from "@/lib/openwa-browser";
import type { WhatsAppConfigPayload, WhatsAppMessageTemplate } from "@/lib/whatsapp/types";
import { notify } from "@/lib/toast";

type EditableTemplate = WhatsAppMessageTemplate & {
  bodyDraft: string;
};

export function WhatsAppNotificationsConfig() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfigPayload | null>(null);
  const [templates, setTemplates] = useState<EditableTemplate[]>([]);
  const [openWaSessions, setOpenWaSessions] = useState<OpenWaSession[]>([]);

  const loadConfig = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/whatsapp-config", { cache: "no-store" });
      const payload = (await response.json()) as WhatsAppConfigPayload & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "No fue posible cargar la configuración.");
      }

      setConfig(payload);
      setTemplates(
        payload.templates.map((template) => ({
          ...template,
          bodyDraft: template.body,
        })),
      );
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al cargar configuración WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    void listOpenWaSessions()
      .then(setOpenWaSessions)
      .catch(() => setOpenWaSessions([]));
  }, []);

  async function handleSave() {
    if (!config) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/whatsapp-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            activeSessionId: config.settings.activeSessionId,
            sendOnBookingConfirmed: config.settings.sendOnBookingConfirmed,
            sendBeforeCheckin: config.settings.sendBeforeCheckin,
            hoursBeforeCheckin: config.settings.hoursBeforeCheckin,
            sendAfterExperience: config.settings.sendAfterExperience,
            hoursAfterCheckin: config.settings.hoursAfterCheckin,
            maxSendAttempts: config.settings.maxSendAttempts,
            defaultCountryCode: config.settings.defaultCountryCode,
          },
          templates: templates.map((template) => ({
            templateKey: template.templateKey,
            body: template.bodyDraft,
            isEnabled: template.isEnabled,
          })),
        }),
      });

      const payload = (await response.json()) as WhatsAppConfigPayload & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "No fue posible guardar.");
      }

      setConfig(payload);
      setTemplates(
        payload.templates.map((template) => ({
          ...template,
          bodyDraft: template.body,
        })),
      );
      notify.success("Configuración de WhatsApp guardada en la base de datos.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <article className="rounded-[2rem] bg-white p-8 coastal-shadow">
        <p className="text-sm text-on-surface-variant">Cargando configuración de WhatsApp...</p>
      </article>
    );
  }

  if (!config) {
    return (
      <article className="rounded-[2rem] bg-white p-8 coastal-shadow">
        <p className="text-sm text-on-surface-variant">
          No se pudo cargar la configuración. Ejecuta <code className="text-primary">npm run db:init</code> y{" "}
          <code className="text-primary">npm run db:seed-whatsapp</code>.
        </p>
        <button
          type="button"
          onClick={() => void loadConfig()}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
      </article>
    );
  }

  return (
    <article className="rounded-[2rem] bg-white p-8 coastal-shadow">
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold text-primary">Mensajes automáticos por WhatsApp</h2>
        <p className="mt-2 text-sm leading-7 text-on-surface-variant">
          Plantillas y reglas guardadas en PostgreSQL. Los envíos usan la sesión activa de OpenWA configurada abajo.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">
            Sesión WhatsApp para reservas y mensajes automáticos
          </label>
          {openWaSessions.length ? (
            <select
              value={config.settings.activeSessionId ?? ""}
              onChange={(event) =>
                setConfig({
                  ...config,
                  settings: {
                    ...config.settings,
                    activeSessionId: event.target.value || null,
                  },
                })
              }
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Detectar automáticamente (primera sesión conectada)</option>
              {openWaSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} — {session.status}
                  {session.phone ? ` (${session.phone})` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={config.settings.activeSessionId ?? ""}
              onChange={(event) =>
                setConfig({
                  ...config,
                  settings: {
                    ...config.settings,
                    activeSessionId: event.target.value.trim() || null,
                  },
                })
              }
              placeholder="UUID de la sesión"
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 font-mono text-sm outline-none focus:border-primary"
            />
          )}
          <p className="mt-2 text-xs text-on-surface-variant">
            Al escanear el QR en{" "}
            <Link href="/admin/whatsapp" className="font-semibold text-primary underline">
              Admin → WhatsApp
            </Link>
            , la sesión conectada se guarda sola. Debe estar en estado <strong>ready</strong> antes de
            enviar desde reservas.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">Indicativo país (sin +)</label>
          <input
            type="text"
            value={config.settings.defaultCountryCode}
            onChange={(event) =>
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  defaultCountryCode: event.target.value.replace(/\D/g, "").slice(0, 5),
                },
              })
            }
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">
            Horas antes del check-in
          </label>
          <input
            type="number"
            min={1}
            max={168}
            value={config.settings.hoursBeforeCheckin}
            onChange={(event) =>
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  hoursBeforeCheckin: Number(event.target.value) || 24,
                },
              })
            }
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">
            Intentos máximos de envío (por reserva y plantilla)
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={config.settings.maxSendAttempts}
            onChange={(event) =>
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  maxSendAttempts: Math.min(10, Math.max(1, Number(event.target.value) || 3)),
                },
              })
            }
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
          />
          <p className="mt-2 text-xs text-on-surface-variant">
            Tras alcanzar el límite, el envío automático se omite. En cada reserva puedes marcar «Reenviar» para
            forzar otro intento.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">
            Horas después del check-in (invitar reseña)
          </label>
          <input
            type="number"
            min={1}
            max={168}
            value={config.settings.hoursAfterCheckin}
            onChange={(event) =>
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  hoursAfterCheckin: Number(event.target.value) || 12,
                },
              })
            }
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none focus:border-primary"
          />
          <p className="mt-2 text-xs text-on-surface-variant">
            Ej: 12 h = al terminar un pasadía de 9 h. Programa un cron que llame a{" "}
            <code className="text-primary">/api/cron/post-experience-reviews</code>.
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3">
          <input
            type="checkbox"
            checked={config.settings.sendOnBookingConfirmed}
            onChange={(event) =>
              setConfig({
                ...config,
                settings: { ...config.settings, sendOnBookingConfirmed: event.target.checked },
              })
            }
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm font-medium text-primary">Enviar al confirmar reserva</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3">
          <input
            type="checkbox"
            checked={config.settings.sendBeforeCheckin}
            onChange={(event) =>
              setConfig({
                ...config,
                settings: { ...config.settings, sendBeforeCheckin: event.target.checked },
              })
            }
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm font-medium text-primary">Recordatorio antes del check-in</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3">
          <input
            type="checkbox"
            checked={config.settings.sendAfterExperience}
            onChange={(event) =>
              setConfig({
                ...config,
                settings: { ...config.settings, sendAfterExperience: event.target.checked },
              })
            }
            className="h-4 w-4 accent-primary"
          />
          <span className="text-sm font-medium text-primary">Invitar a dejar reseña tras la experiencia</span>
        </label>
      </div>

      <div className="mb-4 rounded-2xl bg-surface-container-low p-4 text-xs text-on-surface-variant">
        <p className="font-semibold text-primary">Variables disponibles en plantillas:</p>
        <p className="mt-2 font-mono">{config.placeholders.join("  ")}</p>
      </div>

      <div className="space-y-6">
        {templates.map((template, index) => (
          <div
            key={template.templateKey}
            className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-primary">{template.name}</h3>
                {template.description ? (
                  <p className="mt-1 text-xs text-on-surface-variant">{template.description}</p>
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={template.isEnabled}
                  onChange={(event) => {
                    const next = [...templates];
                    next[index] = { ...template, isEnabled: event.target.checked };
                    setTemplates(next);
                  }}
                  className="h-4 w-4 accent-primary"
                />
                Activa
              </label>
            </div>
            <textarea
              rows={4}
              value={template.bodyDraft}
              onChange={(event) => {
                const next = [...templates];
                next[index] = { ...template, bodyDraft: event.target.value };
                setTemplates(next);
              }}
              className="w-full resize-y rounded-xl border border-outline-variant/30 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white coastal-shadow disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar configuración WhatsApp"}
        </button>
      </div>
    </article>
  );
}
