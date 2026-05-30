import { BookingsManager } from "@/components/admin/bookings-manager";

export const dynamic = "force-dynamic";

export default function AdminBookingsPage() {
  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Gestión de reservas</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Reservas guardadas en PostgreSQL. Al confirmar, se usarán para los mensajes automáticos de WhatsApp.
        </p>
      </section>
      <BookingsManager />
    </div>
  );
}
