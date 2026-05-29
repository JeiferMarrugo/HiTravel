"use client";

import { useMemo, useState } from "react";
import type { OpenWaChat } from "@/lib/admin/types";

type ChatListProps = {
  activeChatId?: string | null;
  chats: OpenWaChat[];
  onSelectChat: (chatId: string) => void;
};

export function ChatList({ activeChatId, chats, onSelectChat }: ChatListProps) {
  const [search, setSearch] = useState("");

  const filteredChats = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return chats;
    }

    return chats.filter(
      (chat) => chat.name.toLowerCase().includes(value) || chat.id.toLowerCase().includes(value) || (chat.lastMessage ?? "").toLowerCase().includes(value),
    );
  }, [chats, search]);

  return (
    <article className="rounded-[2rem] bg-white p-5 coastal-shadow">
      <div className="mb-4">
        <h2 className="text-[22px] font-semibold text-primary">Inbox</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Chats y grupos recientes de la sesión seleccionada.</p>
      </div>

      <div className="mb-4 rounded-full bg-surface-container-low px-4 py-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, chat o mensaje..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-on-surface-variant/60"
        />
      </div>

      <div className="max-h-[580px] space-y-3 overflow-y-auto pr-1">
        {filteredChats.length ? (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;

            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                  isActive
                    ? "border-primary bg-blue-50 shadow-sm"
                    : "border-outline-variant/15 bg-surface-container-lowest hover:border-outline-variant/30 hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">{chat.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-on-surface-variant/60">
                      {chat.kind === "group" ? "Grupo" : chat.kind === "contact" ? "Contacto" : "Chat"}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-primary">{chat.messageCount}</span>
                </div>
                <p className="mt-3 truncate text-sm text-on-surface-variant">{chat.lastMessage || "Sin mensajes recientes"}</p>
              </button>
            );
          })
        ) : (
          <div className="rounded-[1.5rem] bg-surface-container-low p-5 text-sm text-on-surface-variant">
            No hay chats para mostrar todavía en esta sesión.
          </div>
        )}
      </div>
    </article>
  );
}
