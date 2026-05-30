"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/stat-card";
import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { DashboardChannelsChart, DashboardSalesChart, DashboardToursChart } from "@/components/admin/dashboard/dashboard-charts";
import type { DashboardMetricsPayload } from "@/lib/admin/dashboard-metrics";
import { formatCurrency, quickActions } from "@/lib/admin/dashboard-data";
import { formatMoneyDisplay } from "@/lib/catalog/money";

function formatTodayLabel() {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetricsPayload | null>(null);

  useEffect(() => {
    void fetch("/api/admin/dashboard", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: DashboardMetricsPayload) => setMetrics(payload))
      .catch(() => setMetrics(null));
  }, []);

  const dashboardStats = metrics?.stats ?? [];
  const monthlySales = metrics?.monthlySales ?? [];
  const bookingChannels = metrics?.bookingChannels ?? [];
  const tourRevenueMetrics = metrics?.tourRevenueMetrics ?? [];
  const topClients = metrics?.topClients ?? [];
  const recentSales = metrics?.recentSales ?? [];
  const departuresToday = metrics?.departuresToday ?? [];
  const pendingItems = metrics?.pendingItems ?? [];

  return (
    <div className="w-full space-y-8">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Dashboard comercial</h1>
          <p className="mt-2 text-lg capitalize text-on-surface-variant">{formatTodayLabel()}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/reservas"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva reserva
          </Link>
          <Link
            href="/admin/tarifas"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-primary coastal-shadow"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exportar reporte
          </Link>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-semibold text-primary">Ventas mensuales</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Evolución de ingresos y reservas en los últimos 6 meses</p>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">+18.4% vs mes anterior</span>
          </div>
          <DashboardSalesChart data={monthlySales} />
        </article>

        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <div className="mb-2">
            <h2 className="text-[22px] font-semibold text-primary">Canales de reserva</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Distribución de ventas por origen</p>
          </div>
          <DashboardChannelsChart data={bookingChannels} />
          <div className="mt-2 grid gap-2">
            {bookingChannels.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: channel.color }} />
                  <span className="text-on-surface-variant">{channel.name}</span>
                </div>
                <span className="font-semibold text-primary">{channel.value}%</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <div className="mb-6">
            <h2 className="text-[22px] font-semibold text-primary">Ingresos por tour</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Top experiencias del mes por facturación</p>
          </div>
          <DashboardToursChart data={tourRevenueMetrics} />
        </article>

        <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-semibold text-primary">Mejores clientes</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Clientes con mayor valor acumulado</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">emoji_events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-outline-variant/20 text-left text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                  <th className="pb-4 pr-4">Cliente</th>
                  <th className="pb-4 pr-4">Reservas</th>
                  <th className="pb-4 pr-4">Total</th>
                  <th className="pb-4">Última</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((client, index) => (
                  <tr key={client.id} className="border-b border-outline-variant/10 last:border-0">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-primary">{client.name}</p>
                          <p className="text-xs text-on-surface-variant">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-on-surface">{client.bookings}</td>
                    <td className="py-4 pr-4 text-sm font-semibold text-secondary">
                    {formatMoneyDisplay(client.totalSpent, "COP")}
                  </td>
                    <td className="py-4 text-sm text-on-surface-variant">{client.lastBooking}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <article className="rounded-[2rem] bg-white coastal-shadow">
        <div className="flex items-center justify-between border-b border-outline-variant/15 px-6 py-5">
          <div>
            <h2 className="text-[22px] font-semibold text-primary">Ventas recientes</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Últimas transacciones registradas en el sistema</p>
          </div>
          <Link href="/admin/reservas" className="text-sm font-semibold text-primary">
            Ver todas
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-surface-container-low text-left text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Tour</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Pago</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-t border-outline-variant/10">
                  <td className="px-6 py-4 text-sm font-semibold text-primary">{sale.id}</td>
                  <td className="px-6 py-4 text-sm text-on-surface">{sale.customer}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{sale.tour}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{sale.date}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-secondary">
                    {formatMoneyDisplay(sale.amount, "COP")}
                  </td>
                  <td className="px-6 py-4">
                    <BookingStatusBadge status={sale.paymentStatus} />
                  </td>
                  <td className="px-6 py-4">
                    <BookingStatusBadge status={sale.approvalStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.65fr]">
        <article className="rounded-[2rem] bg-white p-8 coastal-shadow">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                <span className="material-symbols-outlined">directions_boat</span>
              </div>
              <h2 className="text-[22px] font-semibold text-primary">Salidas de hoy</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-primary">{departuresToday.length} tours</span>
          </div>

          <div className="space-y-8">
            {departuresToday.map((departure) => (
              <div key={departure.id} className="grid gap-4 sm:grid-cols-[56px_1fr_auto] sm:items-center">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl">
                  <Image src={departure.image} alt={departure.title} fill className="object-cover" sizes="56px" />
                </div>
                <div>
                  <h3 className="text-[18px] font-medium text-on-surface">{departure.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-4 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {departure.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {departure.meetingPoint}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[22px] font-semibold text-primary">{departure.passengers}</p>
                  <p className="text-sm uppercase tracking-[0.12em] text-secondary">{departure.statusLabel}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[2rem] bg-primary p-6 text-white coastal-shadow">
            <h2 className="text-[22px] font-semibold">Acciones rápidas</h2>
            <div className="mt-6 space-y-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-4 rounded-[1.5rem] bg-white/10 p-4 transition hover:bg-white/15"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-container text-primary">
                    <span className="material-symbols-outlined">{action.icon}</span>
                  </div>
                  <div>
                    <p className="text-[18px] font-semibold">{action.title}</p>
                    <p className="text-sm text-white/75">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] bg-white p-6 coastal-shadow">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[22px] font-semibold text-primary">Pendientes</h2>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">{pendingItems.length} acciones</span>
            </div>

            <div className="space-y-5">
              {pendingItems.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-outline-variant/15 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-primary">{item.customer}</p>
                      <p className="text-sm text-on-surface-variant">{item.product}</p>
                    </div>
                    <p className="font-semibold text-secondary">{item.amount}</p>
                  </div>
                  {item.note ? <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-on-surface-variant">{item.note}</p> : null}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
