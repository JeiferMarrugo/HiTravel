"use client";

import { useMemo, useState } from "react";
import type { OpenWaWebhook } from "@/lib/admin/types";
import { notify } from "@/lib/toast";

type WebhooksPanelProps = {
  globalWebhooks: OpenWaWebhook[];
  isLoading: boolean;
  onCreateWebhook: (payload: {
    active: boolean;
    events: string[];
    headers: Record<string, string>;
    retryCount: number;
    secret?: string;
    url: string;
  }) => Promise<void>;
  onDeleteWebhook: (webhookId: string) => Promise<void>;
  onTestWebhook: (webhookId: string) => Promise<void>;
  onUpdateWebhook: (
    webhookId: string,
    payload: Partial<{
      active: boolean;
      events: string[];
      headers: Record<string, string>;
      retryCount: number;
      secret: string;
      url: string;
    }>,
  ) => Promise<void>;
  sessionWebhooks: OpenWaWebhook[];
};

const defaultEvents = "message.received,session.status";

function parseEvents(value: string) {
  return value
    .split(",")
    .map((event) => event.trim())
    .filter(Boolean);
}

export function WebhooksPanel({
  globalWebhooks,
  isLoading,
  onCreateWebhook,
  onDeleteWebhook,
  onTestWebhook,
  onUpdateWebhook,
  sessionWebhooks,
}: WebhooksPanelProps) {
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState(defaultEvents);
  const [secret, setSecret] = useState("");
  const [retryCount, setRetryCount] = useState(3);

  const selectedWebhook = useMemo(
    () => sessionWebhooks.find((webhook) => webhook.id === selectedWebhookId) ?? null,
    [selectedWebhookId, sessionWebhooks],
  );

  async function handleCreateWebhook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!url.trim()) {
      return;
    }

    try {
      await onCreateWebhook({
        url: url.trim(),
        events: parseEvents(events),
        secret: secret.trim() || undefined,
        active: true,
        retryCount,
        headers: {},
      });
      setUrl("");
      setSecret("");
      setEvents(defaultEvents);
      notify.success("Webhook creado correctamente.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible crear el webhook.");
    }
  }

  async function handleTestWebhook(webhookId: string) {
    try {
      await onTestWebhook(webhookId);
      notify.success("Webhook probado correctamente.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible probar el webhook.");
    }
  }

  async function handleToggleActive(webhook: OpenWaWebhook) {
    try {
      await onUpdateWebhook(webhook.id, { active: !webhook.active });
      notify.success("Estado del webhook actualizado.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible actualizar el webhook.");
    }
  }

  async function handleDeleteWebhook(webhookId: string) {
    try {
      await onDeleteWebhook(webhookId);
      notify.success("Webhook eliminado.");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "No fue posible eliminar el webhook.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-primary">Webhooks de la sesión</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Configura eventos para sincronizar OpenWA con otros servicios internos o externos.</p>
        </div>

        <form className="space-y-3" onSubmit={handleCreateWebhook}>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://tuapp.com/webhook"
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <input
            type="text"
            value={events}
            onChange={(event) => setEvents(event.target.value)}
            placeholder="message.received,session.status"
            className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="Secret opcional"
              className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <input
              type="number"
              min={0}
              value={retryCount}
              onChange={(event) => setRetryCount(Number(event.target.value))}
              className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">
            Crear webhook
          </button>
        </form>

        <div className="mt-6 max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {sessionWebhooks.length ? (
            sessionWebhooks.map((webhook) => (
              <button
                key={webhook.id}
                type="button"
                onClick={() => setSelectedWebhookId(webhook.id)}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  selectedWebhookId === webhook.id
                    ? "border-primary bg-blue-50"
                    : "border-outline-variant/15 bg-surface-container-lowest hover:bg-surface-container-low"
                }`}
              >
                <p className="truncate font-semibold text-primary">{webhook.url}</p>
                <p className="mt-2 text-xs text-on-surface-variant">{webhook.events.join(", ")}</p>
              </button>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
              {isLoading ? "Cargando webhooks..." : "No hay webhooks creados para esta sesión."}
            </div>
          )}
        </div>
      </article>

      <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold text-primary">Detalle y cobertura</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Prueba, activa o elimina webhooks, y consulta el inventario global en OpenWA.</p>
        </div>

        {selectedWebhook ? (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] bg-surface-container-low p-5">
              <p className="font-semibold text-primary">{selectedWebhook.url}</p>
              <p className="mt-2 text-sm text-on-surface-variant">Eventos: {selectedWebhook.events.join(", ")}</p>
              <p className="mt-2 text-sm text-on-surface-variant">Activo: {selectedWebhook.active ? "Sí" : "No"}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleTestWebhook(selectedWebhook.id)}
                className="rounded-2xl bg-secondary-container px-4 py-3 text-sm font-semibold text-primary"
              >
                Probar webhook
              </button>
              <button
                type="button"
                onClick={() => void handleToggleActive(selectedWebhook)}
                className="rounded-2xl bg-surface-container-high px-4 py-3 text-sm font-semibold text-primary"
              >
                {selectedWebhook.active ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteWebhook(selectedWebhook.id)}
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
            Selecciona un webhook para probarlo o actualizarlo.
          </div>
        )}

        <div className="mt-8 rounded-[1.5rem] bg-surface-container-low p-5">
          <h3 className="font-semibold text-primary">Todos los webhooks del servidor</h3>
          <div className="mt-4 space-y-3">
            {globalWebhooks.length ? (
              globalWebhooks.map((webhook) => (
                <div key={webhook.id} className="rounded-2xl bg-white p-4 text-sm">
                  <p className="font-medium text-primary">{webhook.url}</p>
                  <p className="mt-1 text-on-surface-variant">{webhook.events.join(", ")}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">OpenWA no reportó webhooks globales todavía.</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
