import { NextResponse } from "next/server";
import { listBookingGuests } from "@/lib/catalog/booking-guests";
import { getPublicBookingByCode } from "@/lib/catalog/public-booking";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;

  try {
    const booking = await getPublicBookingByCode(code);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    const guests = await listBookingGuests(booking.id);

    return NextResponse.json({
      booking: {
        bookingCode: booking.bookingCode,
        tourName: booking.tourName,
        customerName: booking.customerName,
        checkinAt: booking.checkinAt,
        adults: booking.adults,
        children: booking.children,
        amountCents: booking.amountCents,
        currency: booking.currency,
        approvalStatus: booking.approvalStatus,
        paymentStatus: booking.paymentStatus,
        paidCents: booking.paidCents,
        balanceCents: booking.balanceCents,
      },
      guests: guests.map((guest) => ({
        fullName: guest.fullName,
        idTypeName: guest.idTypeName,
        isChild: guest.isChild,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar la reserva.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
