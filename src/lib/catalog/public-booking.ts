import { createBooking, getBookingByCode } from "@/lib/catalog/bookings";
import { replaceBookingGuests, type UpsertBookingGuestInput } from "@/lib/catalog/booking-guests";
import { quotePublicTour } from "@/lib/catalog/public-tour-quote";
import { getTourBySlug } from "@/lib/catalog/tours";
import type { BookingRecord } from "@/lib/catalog/types";
import { parseAndValidatePhone } from "@/lib/phone/validate";

export type CreatePublicBookingInput = {
  tourSlug: string;
  customerName: string;
  customerEmail?: string;
  customerCity: string;
  customerPhone: string;
  customerIdTypeId: string;
  customerIdNumber: string;
  checkinAt: string;
  adults: number;
  children: number;
  notes?: string;
  guests?: UpsertBookingGuestInput[];
};

export async function createPublicBooking(input: CreatePublicBookingInput): Promise<BookingRecord> {
  const tour = await getTourBySlug(input.tourSlug);
  if (!tour || !tour.isActive) {
    throw new Error("Este tour no está disponible para reservar.");
  }

  const phone = parseAndValidatePhone(input.customerPhone, "CO");
  const quote = await quotePublicTour({
    slug: input.tourSlug,
    adults: input.adults,
    children: input.children,
    checkinAt: input.checkinAt,
  });

  if (!quote) {
    throw new Error("No fue posible calcular el precio de la reserva.");
  }

  const booking = await createBooking({
    tourId: tour.id,
    customerName: input.customerName.trim(),
    customerPhone: phone.national.replace(/\D/g, "").length >= 10 ? phone.national : phone.e164,
    customerPhoneE164: phone.e164,
    customerEmail: input.customerEmail?.trim(),
    customerCity: input.customerCity.trim(),
    customerIdTypeId: input.customerIdTypeId,
    customerIdNumber: input.customerIdNumber.trim(),
    checkinAt: input.checkinAt.includes("T")
      ? new Date(input.checkinAt).toISOString()
      : new Date(`${input.checkinAt}T08:00:00`).toISOString(),
    amountCents: quote.totalCents,
    subtotalCents: quote.subtotalCents,
    discountCents: quote.discountCents,
    currency: quote.currency,
    adults: input.adults,
    children: input.children,
    paymentStatus: "pending",
    approvalStatus: "pending",
    bookingSource: "website",
    notes: input.notes?.trim(),
  });

  if (input.guests?.length) {
    await replaceBookingGuests(booking.id, input.guests);
  }

  return (await getBookingByCode(booking.bookingCode)) ?? booking;
}

export async function getPublicBookingByCode(code: string) {
  const booking = await getBookingByCode(code.trim().toUpperCase());
  if (!booking) {
    return null;
  }
  return booking;
}
