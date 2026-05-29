"use client";

import type { OpenWaMessageStats, OpenWaOverviewStats, OpenWaSessionStats } from "@/lib/admin/types";

type StatsPanelProps = {
  messageStats?: OpenWaMessageStats | null;
  overviewStats?: OpenWaOverviewStats | null;
  sessionStats?: OpenWaSessionStats | null;
};

export function StatsPanel({ messageStats, overviewStats, sessionStats }: StatsPanelProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Sesiones activas</p>
          <p className="mt-2 text-[30px] font-extrabold text-primary">{overviewStats?.sessions.active ?? 0}</p>
        </article>
        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Mensajes enviados</p>
          <p className="mt-2 text-[30px] font-extrabold text-primary">{overviewStats?.messages.sent ?? 0}</p>
        </article>
        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Mensajes recibidos</p>
          <p className="mt-2 text-[30px] font-extrabold text-primary">{overviewStats?.messages.received ?? 0}</p>
        </article>
        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <p className="text-sm text-on-surface-variant">Mensajes fallidos</p>
          <p className="mt-2 text-[30px] font-extrabold text-primary">{overviewStats?.messages.failed ?? 0}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <h2 className="text-[22px] font-semibold text-primary">Distribución por tipo</h2>
          <div className="mt-6 space-y-3">
            {messageStats && Object.keys(messageStats.byType).length ? (
              Object.entries(messageStats.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between rounded-2xl bg-surface-container-low p-4 text-sm">
                  <span className="font-medium text-primary">{type}</span>
                  <span className="rounded-full bg-white px-3 py-1 font-semibold text-primary">{count}</span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-surface-container-low p-5 text-sm text-on-surface-variant">
                No hay datos de tipos de mensaje todavía.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <h2 className="text-[22px] font-semibold text-primary">Top chats y sesiones</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">Chats más activos</h3>
              {messageStats?.topChats.length ? (
                messageStats.topChats.map((chat) => (
                  <div key={chat.chatId} className="rounded-2xl bg-surface-container-low p-4 text-sm">
                    <p className="truncate font-medium text-primary">{chat.chatId}</p>
                    <p className="mt-1 text-on-surface-variant">{chat.messageCount} mensajes</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Sin actividad suficiente todavía.</div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60">Sesión activa</h3>
              {sessionStats ? (
                <div className="rounded-2xl bg-surface-container-low p-5">
                  <p className="font-semibold text-primary">{sessionStats.session.name}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">Estado: {sessionStats.session.status}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-on-surface-variant">Enviados</p>
                      <p className="mt-1 font-semibold text-primary">{sessionStats.messages.sent}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-on-surface-variant">Recibidos</p>
                      <p className="mt-1 font-semibold text-primary">{sessionStats.messages.received}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  Selecciona una sesión para ver sus métricas detalladas.
                </div>
              )}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
