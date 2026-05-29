"use client";

import { useState } from "react";

type MessageComposerProps = {
  chatId?: string | null;
  chatName?: string;
  disabled?: boolean;
  onCancelReply?: () => void;
  onSend: (text: string) => Promise<void>;
  replyingToMessage?: string | null;
};

export function MessageComposer({
  chatId,
  chatName,
  disabled = false,
  onCancelReply,
  onSend,
  replyingToMessage,
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!message.trim() || disabled || !chatId) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await onSend(message.trim());
      setMessage("");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "No fue posible enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="rounded-[1.75rem] bg-white p-5 coastal-shadow" onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-on-surface-variant/70">Composer</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {chatId ? `Escribiendo en ${chatName ?? chatId}` : "Selecciona un chat para empezar a conversar."}
          </p>
        </div>
        {replyingToMessage ? (
          <button type="button" onClick={onCancelReply} className="rounded-full bg-surface-container-low px-3 py-1 text-xs font-semibold text-primary">
            Respondiendo
          </button>
        ) : null}
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={chatId ? "Escribe tu mensaje..." : "Primero selecciona una conversación"}
        disabled={disabled || !chatId || isSending}
        rows={5}
        className="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-on-surface-variant">Las acciones avanzadas de medios y archivos pueden añadirse después sobre este mismo composer.</p>
        <button
          type="submit"
          disabled={disabled || !chatId || !message.trim() || isSending}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
