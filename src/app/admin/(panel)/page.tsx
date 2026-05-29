import Image from "next/image";
import Link from "next/link";
import { dashboardStats, departuresToday, pendingItems, quickActions } from "@/lib/admin/dashboard-data";

export default function AdminDashboardPage() {
  const revenueCard = dashboardStats[0];

  return (
    <div className="w-full">
      <section className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Resumen operativo</h1>
          <p className="mt-2 text-lg text-on-surface-variant">Actualizaciones en vivo para el 12 de julio de 2024</p>
        </div>

        <article className="w-full max-w-xs rounded-[1.75rem] bg-white p-5 coastal-shadow">
          <p className="text-sm font-medium text-on-surface-variant">{revenueCard.label}</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="text-[36px] font-extrabold leading-[44px] text-primary">{revenueCard.value}</p>
            <div className="flex h-10 items-end gap-1">
              <span className="h-6 w-2 rounded-full bg-surface-container-high" />
              <span className="h-8 w-2 rounded-full bg-surface-container-high" />
              <span className="h-10 w-2 rounded-full bg-secondary-container" />
              <span className="h-7 w-2 rounded-full bg-surface-container-high" />
              <span className="h-9 w-2 rounded-full bg-surface-container-high" />
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.65fr]">
        <article className="rounded-[2rem] bg-white p-8 coastal-shadow">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                <span className="material-symbols-outlined">directions_boat</span>
              </div>
              <div>
                <h2 className="text-[22px] font-semibold text-primary">Salidas de hoy</h2>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-primary">8 tours en total</span>
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

          <div className="mt-12 text-center">
            <Link href="/admin/reservas" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Ver manifiesto detallado
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
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
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">3 acción requerida</span>
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

                  {!item.note ? (
                    <div className="mt-4 flex gap-3">
                      <button className="rounded-xl bg-surface-container px-4 py-2 text-sm font-medium text-primary">Revisar</button>
                      <button className="rounded-xl bg-secondary-container px-4 py-2 text-sm font-medium text-primary">Confirmar</button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
