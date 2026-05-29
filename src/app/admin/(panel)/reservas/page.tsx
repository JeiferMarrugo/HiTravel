import { BookingStatusBadge } from "@/components/admin/booking-status-badge";
import { DataTable } from "@/components/admin/data-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { StatCard } from "@/components/admin/stat-card";
import { bookings, bookingFilters, bookingStats } from "@/lib/admin/bookings-data";

const customerToneClasses = {
  blue: "bg-blue-100 text-primary",
  yellow: "bg-secondary-container text-primary",
  dark: "bg-primary text-white",
  olive: "bg-yellow-800 text-white",
};

export default function AdminBookingsPage() {
  const rows = bookings.map((booking) => [
    <div key={`${booking.id}-id`} className="font-bold text-primary">
      {booking.id}
    </div>,
    <div key={`${booking.id}-customer`} className="flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${customerToneClasses[booking.customerTone]}`}>
        {booking.customerCode}
      </div>
      <div>
        <p className="font-medium text-on-surface">{booking.customer}</p>
      </div>
    </div>,
    <div key={`${booking.id}-tour`}>
      <p>{booking.tourName}</p>
      {booking.tag ? <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{booking.tag}</span> : null}
    </div>,
    <div key={`${booking.id}-date`}>{booking.date}</div>,
    <div key={`${booking.id}-amount`} className="font-semibold text-primary">
      {booking.amount}
    </div>,
    <BookingStatusBadge key={`${booking.id}-payment`} status={booking.paymentStatus} />,
    <div key={`${booking.id}-status`} className="flex flex-wrap gap-2">
      <BookingStatusBadge status={booking.approvalStatus} />
      {booking.approvalStatus === "pending" ? (
        <button className="rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary">Aprobar</button>
      ) : null}
    </div>,
  ]);

  return (
    <div className="w-full">
      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Gestión de reservas</h1>
          <p className="mt-2 text-lg text-on-surface-variant">Monitorea y administra todas las reservas en tiempo real.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-2xl border border-outline-variant/30 bg-white px-5 py-3 text-sm font-semibold text-primary coastal-shadow">
            Exportar CSV
          </button>
          <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white coastal-shadow">
            Sincronizar órdenes
          </button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {bookingStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <section className="mb-8">
        <FilterBar
          chips={bookingFilters}
          trailing={<button className="text-sm font-medium text-on-surface-variant">Limpiar filtros</button>}
        />
      </section>

      <section>
        <DataTable
          headers={["ID orden", "Cliente", "Tour", "Fecha", "Monto", "Pago", "Estado"]}
          rows={rows}
          footer={
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-on-surface-variant">Mostrando 1-10 de 1.284 reservas</p>
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 rounded-xl bg-surface-container text-primary">‹</button>
                <button className="h-10 w-10 rounded-xl bg-primary text-white">1</button>
                <button className="h-10 w-10 rounded-xl bg-surface-container text-primary">2</button>
                <button className="h-10 w-10 rounded-xl bg-surface-container text-primary">3</button>
                <span className="px-2 text-on-surface-variant">…</span>
                <button className="h-10 w-10 rounded-xl bg-surface-container text-primary">›</button>
              </div>
            </div>
          }
        />
      </section>
    </div>
  );
}
