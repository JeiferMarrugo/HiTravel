import { BookingTravelersPanel } from "@/components/admin/booking-travelers-panel";

type AdminBookingTravelersPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminBookingTravelersPage({ params }: AdminBookingTravelersPageProps) {
  const { id } = await params;

  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Datos de viajeros</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Titular, acompañantes, identificación y marca de cliente atendido.
        </p>
      </section>
      <BookingTravelersPanel bookingId={id} />
    </div>
  );
}
