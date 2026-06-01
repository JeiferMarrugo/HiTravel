import Link from "next/link";
import { BookingsManager } from "@/components/admin/bookings-manager";
import { getBookingStats, listBookings } from "@/lib/catalog/bookings";
import { listPromotions } from "@/lib/catalog/promotions";
import { listTours } from "@/lib/catalog/tours";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const [bookings, stats, tours, promotions] = await Promise.all([
    listBookings(),
    getBookingStats(),
    listTours(),
    listPromotions({ activeOnly: true }),
  ]);

  return (
    <div className="w-full">
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Gestión de reservas</h1>
          <p className="mt-2 text-lg text-on-surface-variant">
            Reservas guardadas en PostgreSQL. Al confirmar, se usarán para los mensajes automáticos de WhatsApp.
          </p>
        </div>
        <Link
          href="/admin/reservas/huespedes"
          className="inline-flex items-center gap-2 rounded-2xl bg-secondary-container px-5 py-3 text-sm font-semibold text-primary shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">groups</span>
          Listado de huéspedes
        </Link>
      </section>
      <BookingsManager
        initialBookings={bookings}
        initialStats={stats}
        initialTours={tours}
        initialPromotions={promotions}
      />
    </div>
  );
}
