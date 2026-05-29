"use client";

import type { OpenWaMessage } from "@/lib/admin/types";

type ChatThreadProps = {
  activeChatId?: string | null;
  activeChatName?: string;
  messages: OpenWaMessage[];
  onDeleteMessage?: (message: OpenWaMessage) => void;
  onReactMessage?: (message: OpenWaMessage, emoji: string) => void;
  onReplyMessage?: (message: OpenWaMessage) => void;
};

function formatTimestamp(timestamp?: number | null, createdAt?: string) {
  const source = timestamp ? new Date(timestamp * 1000) : createdAt ? new Date(createdAt) : null;

  if (!source) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(source);
}

export function ChatThread({
  activeChatId,
  activeChatName,
  messages,
  onDeleteMessage,
  onReactMessage,
  onReplyMessage,
}: ChatThreadProps) {
  if (!activeChatId) {
    return (
      <article className="flex min-h-[420px] items-center justify-center rounded-[2rem] bg-white p-8 text-center coastal-shadow">
        <div className="max-w-md">
          <h2 className="text-[24px] font-semibold text-primary">Selecciona una conversación</h2>
          <p className="mt-3 text-on-surface-variant">Elige un chat o grupo del inbox para ver el historial y responder en tiempo real.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[2rem] bg-white coastal-shadow">
      <div className="border-b border-outline-variant/15 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant/60">Conversación activa</p>
        <h2 className="mt-2 text-[24px] font-semibold text-primary">{activeChatName ?? activeChatId}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">{activeChatId}</p>
      </div>

      <div className="max-h-[520px] space-y-4 overflow-y-auto px-6 py-6">
        {messages.length ? (
          [...messages]
            .sort((firstMessage, secondMessage) => {
              const firstValue = firstMessage.timestamp ?? new Date(firstMessage.createdAt).getTime() / 1000;
              const secondValue = secondMessage.timestamp ?? new Date(secondMessage.createdAt).getTime() / 1000;
              return firstValue - secondValue;
            })
            .map((message) => {
              const isOutgoing = message.direction === "outgoing";

              return (
                <div key={message.id} className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-[1.5rem] px-4 py-3 ${
                      isOutgoing ? "bg-primary text-white" : "bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${isOutgoing ? "text-white/75" : "text-on-surface-variant/70"}`}>
                        {isOutgoing ? "Tú" : "Contacto"}
                      </p>
                      <span className={`text-xs ${isOutgoing ? "text-white/75" : "text-on-surface-variant/70"}`}>
                        {formatTimestamp(message.timestamp, message.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body || "(sin contenido de texto)"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onReplyMessage?.(message)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isOutgoing ? "bg-white/10 text-white" : "bg-white text-primary"
                        }`}
                      >
                        Responder
                      </button>
                      <button
                        type="button"
                        onClick={() => onReactMessage?.(message, "👍")}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isOutgoing ? "bg-white/10 text-white" : "bg-white text-primary"
                        }`}
                      >
                        👍
                      </button>
                      {isOutgoing ? (
                        <button
                          type="button"
                          onClick={() => onDeleteMessage?.(message)}
                          className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-100"
                        >
                          Eliminar
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
            No hay mensajes guardados todavía para esta conversación.
          </div>
        )}
      </div>
    </article>
  );
}
