import { BookingPaymentsPanel } from "@/components/admin/booking-payments-panel";

type AdminBookingPaymentsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBookingPaymentsPage({ params }: AdminBookingPaymentsPageProps) {
  const { id } = await params;

  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Pagos de la reserva</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Registra abonos, sube comprobantes y controla el saldo pendiente.
        </p>
      </section>
      <BookingPaymentsPanel bookingId={id} />
    </div>
  );
}
