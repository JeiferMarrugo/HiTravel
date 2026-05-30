import { query } from "@/lib/db";
import { toNullableUuid } from "@/lib/db/uuid";
import type { BookingGuestRecord } from "@/lib/catalog/types";

type GuestRow = {
  id: string;
  booking_id: string;
  full_name: string;
  id_type_id: string | null;
  id_type_name: string | null;
  id_number: string | null;
  is_child: boolean;
  sort_order: number;
  created_at: Date;
};

function mapGuest(row: GuestRow): BookingGuestRecord {
  return {
    id: row.id,
    bookingId: row.booking_id,
    fullName: row.full_name,
    idTypeId: row.id_type_id,
    idTypeName: row.id_type_name,
    idNumber: row.id_number,
    isChild: row.is_child,
    sortOrder: row.sort_order,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listBookingGuests(bookingId: string): Promise<BookingGuestRecord[]> {
  const rows = await query<GuestRow>(
    `SELECT g.*, t.name AS id_type_name
     FROM booking_guests g
     LEFT JOIN catalog_id_types t ON t.id = g.id_type_id
     WHERE g.booking_id = $1
     ORDER BY g.sort_order ASC, g.created_at ASC`,
    [bookingId],
  );
  return rows.map(mapGuest);
}

export type UpsertBookingGuestInput = {
  id?: string;
  fullName: string;
  idTypeId?: string | null;
  idNumber?: string | null;
  isChild?: boolean;
  sortOrder?: number;
};

export async function replaceBookingGuests(
  bookingId: string,
  guests: UpsertBookingGuestInput[],
): Promise<BookingGuestRecord[]> {
  await query("DELETE FROM booking_guests WHERE booking_id = $1", [bookingId]);

  for (let index = 0; index < guests.length; index += 1) {
    const guest = guests[index];
    const name = guest.fullName.trim();
    if (!name) {
      continue;
    }

    await query(
      `INSERT INTO booking_guests (booking_id, full_name, id_type_id, id_number, is_child, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        bookingId,
        name,
        toNullableUuid(guest.idTypeId),
        guest.idNumber?.trim() || null,
        guest.isChild ?? false,
        guest.sortOrder ?? index,
      ],
    );
  }

  return listBookingGuests(bookingId);
}
