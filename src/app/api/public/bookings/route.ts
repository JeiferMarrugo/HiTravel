import { NextResponse } from "next/server";
import { createPublicBooking } from "@/lib/catalog/public-booking";
import { requireUuid, toNullableUuid } from "@/lib/db/uuid";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const tourSlug = typeof body.tourSlug === "string" ? body.tourSlug : "";
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerCity = typeof body.customerCity === "string" ? body.customerCity.trim() : "";
    const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone : "";
    const customerIdNumber = typeof body.customerIdNumber === "string" ? body.customerIdNumber.trim() : "";
    const checkinAt = typeof body.checkinAt === "string" ? body.checkinAt : "";

    if (!tourSlug) {
      return NextResponse.json({ error: "Tour no válido." }, { status: 400 });
    }
    if (!customerName) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }
    if (!customerCity) {
      return NextResponse.json({ error: "La ciudad es obligatoria." }, { status: 400 });
    }
    if (!customerPhone) {
      return NextResponse.json({ error: "El teléfono es obligatorio." }, { status: 400 });
    }
    if (!customerIdNumber) {
      return NextResponse.json({ error: "El número de identificación es obligatorio." }, { status: 400 });
    }
    if (!checkinAt) {
      return NextResponse.json({ error: "Selecciona la fecha del pasadía." }, { status: 400 });
    }

    let customerIdTypeId: string;
    try {
      customerIdTypeId = requireUuid(
        typeof body.customerIdTypeId === "string" ? body.customerIdTypeId : "",
        "El tipo de identificación",
      );
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Tipo de identificación inválido." },
        { status: 400 },
      );
    }

    const adults = Math.max(1, Number(body.adults) || 1);
    const children = Math.max(0, Number(body.children) || 0);

    const guests = Array.isArray(body.guests)
      ? body.guests
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
          .map((item, index) => ({
            fullName: typeof item.fullName === "string" ? item.fullName : "",
            idTypeId: toNullableUuid(typeof item.idTypeId === "string" ? item.idTypeId : null),
            idNumber: typeof item.idNumber === "string" ? item.idNumber : null,
            isChild: Boolean(item.isChild),
            sortOrder: index,
          }))
          .filter((item) => item.fullName.trim())
      : [];

    const booking = await createPublicBooking({
      tourSlug,
      customerName,
      customerEmail: typeof body.customerEmail === "string" ? body.customerEmail : undefined,
      customerCity,
      customerPhone,
      customerIdTypeId,
      customerIdNumber,
      checkinAt,
      adults,
      children,
      notes: typeof body.notes === "string" ? body.notes : undefined,
      guests,
    });

    return NextResponse.json(
      {
        bookingCode: booking.bookingCode,
        id: booking.id,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible crear la reserva.";
    const status =
      message.includes("obligatorio") ||
      message.includes("válido") ||
      message.includes("disponible") ||
      message.includes("teléfono")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
