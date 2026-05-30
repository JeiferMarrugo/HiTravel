import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, WhatsappFab } from "@/components/site-chrome";
import { formatMoneyDisplay } from "@/lib/catalog/money";
import { listBookingGuests } from "@/lib/catalog/booking-guests";
import { getPublicBookingByCode } from "@/lib/catalog/public-booking";
import { getVisitorPricingContext } from "@/lib/pricing/visitor-currency";

type ReservaConfirmacionPageProps = {
  params: Promise<{ code: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReservaConfirmacionPage({ params }: ReservaConfirmacionPageProps) {
  const { code } = await params;
  const { content } = await getVisitorPricingContext();
  const booking = await getPublicBookingByCode(code);

  if (!booking) {
    notFound();
  }

  const guests = await listBookingGuests(booking.id);

  return (
    <>
      <TopNav content={content} active="tours" />
      <main className="section-shell py-10 md:py-14">
        <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 coastal-shadow md:p-10">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-800">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h1 className="text-2xl font-extrabold text-primary md:text-3xl">¡Solicitud de reserva recibida!</h1>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Guarda tu código <strong className="text-primary">{booking.bookingCode}</strong>. Te escribiremos por
            WhatsApp al número que indicaste para confirmar disponibilidad y pago.
          </p>

          <dl className="mt-8 space-y-4 rounded-2xl bg-surface-container-low p-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Tour</dt>
              <dd className="font-semibold text-primary">{booking.tourName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Titular</dt>
              <dd className="font-semibold text-primary">{booking.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Salida</dt>
              <dd className="text-right font-medium text-primary">{formatDate(booking.checkinAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Viajeros</dt>
              <dd className="font-medium text-primary">
                {booking.adults} adulto{booking.adults === 1 ? "" : "s"}
                {booking.children > 0 ? ` · ${booking.children} niño${booking.children === 1 ? "" : "s"}` : ""}
              </dd>
            </div>
            {booking.amountCents ? (
              <div className="flex justify-between gap-4 border-t border-outline-variant/20 pt-4">
                <dt className="text-on-surface-variant">Total estimado</dt>
                <dd className="text-lg font-bold text-primary">
                  {formatMoneyDisplay(booking.amountCents, booking.currency)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Estado</dt>
              <dd className="font-medium capitalize text-primary">{booking.approvalStatus}</dd>
            </div>
          </dl>

          {guests.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-bold text-primary">Acompañantes registrados</h2>
              <ul className="mt-2 space-y-2 text-sm text-on-surface-variant">
                {guests.map((guest) => (
                  <li key={guest.id}>
                    {guest.fullName}
                    {guest.idTypeName ? ` · ${guest.idTypeName}` : ""}
                    {guest.isChild ? " (niño)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tours" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Ver más tours
            </Link>
            <Link href="/contacto" className="rounded-xl border px-5 py-3 text-sm font-semibold text-primary">
              Contactar asesor
            </Link>
          </div>
        </div>
      </main>
      <WhatsappFab content={content} />
    </>
  );
}
