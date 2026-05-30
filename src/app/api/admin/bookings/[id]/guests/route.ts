import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { listBookingGuests, replaceBookingGuests } from "@/lib/catalog/booking-guests";
import { getBookingById, updateBooking } from "@/lib/catalog/bookings";
import { toNullableUuid } from "@/lib/db/uuid";
import { parseAndValidatePhone } from "@/lib/phone/validate";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    const guests = await listBookingGuests(id);
    return NextResponse.json({ booking, guests });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar viajeros.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
    }

    if (body.booking && typeof body.booking === "object") {
      const record = body.booking as Record<string, unknown>;
      let customerPhone: string | undefined;
      let customerPhoneE164: string | undefined;
      if (typeof record.customerPhone === "string" && record.customerPhone.trim()) {
        const parsed = parseAndValidatePhone(record.customerPhone, "CO");
        customerPhone = parsed.national;
        customerPhoneE164 = parsed.e164;
      }

      await updateBooking(id, {
        customerName: typeof record.customerName === "string" ? record.customerName : undefined,
        customerPhone,
        customerPhoneE164,
        customerEmail: typeof record.customerEmail === "string" ? record.customerEmail : undefined,
        customerCity: typeof record.customerCity === "string" ? record.customerCity : undefined,
        customerIdTypeId:
          typeof record.customerIdTypeId === "string" ? record.customerIdTypeId : undefined,
        customerIdNumber:
          typeof record.customerIdNumber === "string" ? record.customerIdNumber : undefined,
      });
    }

    const guests = Array.isArray(body.guests)
      ? await replaceBookingGuests(
          id,
          body.guests
            .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
            .map((item, index) => ({
              fullName: typeof item.fullName === "string" ? item.fullName : "",
              idTypeId: toNullableUuid(typeof item.idTypeId === "string" ? item.idTypeId : null),
              idNumber: typeof item.idNumber === "string" ? item.idNumber : null,
              isChild: Boolean(item.isChild),
              sortOrder: index,
            })),
        )
      : await listBookingGuests(id);

    const updatedBooking = await getBookingById(id);
    return NextResponse.json({ booking: updatedBooking, guests });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar viajeros.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
