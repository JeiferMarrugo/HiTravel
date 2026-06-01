import { query } from "@/lib/db";

export type TravelerOverviewRow = {
  booking_id: string;
  booking_code: string;
  tour_name: string;
  checkin_at: Date;
  approval_status: string;
  booking_source: string | null;
  full_name: string;
  id_type_name: string | null;
  id_number: string | null;
  is_child: boolean;
  traveler_role: "titular" | "acompanante" | "nino";
  customer_phone: string | null;
  customer_city: string | null;
};

export type TravelerOverviewItem = {
  bookingId: string;
  bookingCode: string;
  tourName: string;
  checkinAt: string;
  approvalStatus: string;
  bookingSource: string | null;
  fullName: string;
  idTypeName: string | null;
  idNumber: string | null;
  isChild: boolean;
  travelerRole: "titular" | "acompanante" | "nino";
  customerPhone: string | null;
  customerCity: string | null;
};

function mapRow(row: TravelerOverviewRow): TravelerOverviewItem {
  return {
    bookingId: row.booking_id,
    bookingCode: row.booking_code,
    tourName: row.tour_name,
    checkinAt: row.checkin_at.toISOString(),
    approvalStatus: row.approval_status,
    bookingSource: row.booking_source,
    fullName: row.full_name,
    idTypeName: row.id_type_name,
    idNumber: row.id_number,
    isChild: row.is_child,
    travelerRole: row.traveler_role,
    customerPhone: row.customer_phone,
    customerCity: row.customer_city,
  };
}

export async function listTravelersOverview(options: {
  search?: string;
  bookingCode?: string;
  limit?: number;
}): Promise<TravelerOverviewItem[]> {
  const limit = Math.min(500, Math.max(1, options.limit ?? 200));
  const search = options.search?.trim() || null;
  const bookingCode = options.bookingCode?.trim().toUpperCase() || null;

  const rows = await query<TravelerOverviewRow>(
    `
    SELECT * FROM (
      SELECT
        b.id AS booking_id,
        b.booking_code,
        b.tour_name,
        b.checkin_at,
        b.approval_status,
        b.booking_source,
        b.customer_name AS full_name,
        t.name AS id_type_name,
        b.customer_id_number AS id_number,
        FALSE AS is_child,
        'titular'::text AS traveler_role,
        COALESCE(b.customer_phone_e164, b.customer_phone) AS customer_phone,
        b.customer_city,
        0 AS sort_order
      FROM bookings b
      LEFT JOIN catalog_id_types t ON t.id = b.customer_id_type_id
      WHERE ($1::text IS NULL OR b.booking_code = $1)
        AND (
          $2::text IS NULL
          OR b.customer_name ILIKE '%' || $2 || '%'
          OR b.customer_id_number ILIKE '%' || $2 || '%'
          OR b.booking_code ILIKE '%' || $2 || '%'
        )

      UNION ALL

      SELECT
        b.id AS booking_id,
        b.booking_code,
        b.tour_name,
        b.checkin_at,
        b.approval_status,
        b.booking_source,
        g.full_name,
        t.name AS id_type_name,
        g.id_number,
        g.is_child,
        CASE WHEN g.is_child THEN 'nino' ELSE 'acompanante' END AS traveler_role,
        COALESCE(b.customer_phone_e164, b.customer_phone) AS customer_phone,
        b.customer_city,
        g.sort_order + 1 AS sort_order
      FROM booking_guests g
      INNER JOIN bookings b ON b.id = g.booking_id
      LEFT JOIN catalog_id_types t ON t.id = g.id_type_id
      WHERE ($1::text IS NULL OR b.booking_code = $1)
        AND (
          $2::text IS NULL
          OR g.full_name ILIKE '%' || $2 || '%'
          OR g.id_number ILIKE '%' || $2 || '%'
          OR b.booking_code ILIKE '%' || $2 || '%'
        )
    ) travelers
    ORDER BY checkin_at DESC, booking_code ASC, sort_order ASC
    LIMIT $3
    `,
    [bookingCode, search, limit],
  );

  return rows.map(mapRow);
}
