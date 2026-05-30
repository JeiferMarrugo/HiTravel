import { query } from "@/lib/db";
import { toNullableUuid } from "@/lib/db/uuid";
import { calculateBookingPromotions } from "@/lib/catalog/booking-promotion-calc";
import { syncBookingPromotions } from "@/lib/catalog/booking-promotions";
import { attachPaymentSummary, sumPaidForBooking } from "@/lib/catalog/payments";
import type {
  AppliedPromotion,
  ApprovalStatus,
  BookingRecord,
  CreateBookingInput,
  PaymentStatus,
  UpdateBookingInput,
} from "@/lib/catalog/types";

type BookingRow = {
  id: string;
  booking_code: string;
  tour_id: string | null;
  tour_name: string;
  customer_name: string;
  customer_phone: string;
  customer_phone_e164: string | null;
  customer_email: string | null;
  customer_city: string | null;
  customer_id_type_id: string | null;
  customer_id_type_name?: string | null;
  customer_id_number: string | null;
  booking_source: string;
  checkin_at: Date;
  amount_cents: number | null;
  currency: string;
  adults: number;
  children: number;
  payment_status: PaymentStatus;
  approval_status: ApprovalStatus;
  notes: string | null;
  promotion_id: string | null;
  promotion_name?: string | null;
  subtotal_cents: number | null;
  discount_cents: number;
  applied_promotions_json?: AppliedPromotion[] | null;
  experience_completed_at: Date | null;
  customer_attended_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

const bookingExtrasSelect = `
  (SELECT t.name FROM catalog_id_types t WHERE t.id = b.customer_id_type_id) AS customer_id_type_name,
  (SELECT string_agg(bp.promotion_name, ' + ' ORDER BY bp.sort_order)
   FROM booking_promotions bp WHERE bp.booking_id = b.id) AS promotion_name,
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'promotionId', bp.promotion_id,
        'promotionName', bp.promotion_name,
        'discountCents', bp.discount_cents
      ) ORDER BY bp.sort_order
    ) FROM booking_promotions bp WHERE bp.booking_id = b.id),
    '[]'::json
  ) AS applied_promotions_json
`;

function parseAppliedPromotions(raw: unknown): AppliedPromotion[] {
  if (!raw) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw as AppliedPromotion[];
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as AppliedPromotion[];
    } catch {
      return [];
    }
  }
  return [];
}

function mapBooking(row: BookingRow): Omit<BookingRecord, "paidCents" | "balanceCents"> {
  const appliedPromotions = parseAppliedPromotions(row.applied_promotions_json);
  return {
    id: row.id,
    bookingCode: row.booking_code,
    tourId: row.tour_id,
    tourName: row.tour_name,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerPhoneE164: row.customer_phone_e164,
    customerEmail: row.customer_email,
    customerCity: row.customer_city,
    customerIdTypeId: row.customer_id_type_id,
    customerIdTypeName: row.customer_id_type_name ?? null,
    customerIdNumber: row.customer_id_number,
    bookingSource: row.booking_source ?? "admin",
    checkinAt: row.checkin_at.toISOString(),
    amountCents: row.amount_cents,
    currency: row.currency,
    adults: row.adults,
    children: row.children,
    paymentStatus: row.payment_status,
    approvalStatus: row.approval_status,
    notes: row.notes,
    promotionId: row.promotion_id,
    promotionName: row.promotion_name ?? null,
    promotionIds: appliedPromotions.map((p) => p.promotionId),
    appliedPromotions,
    subtotalCents: row.subtotal_cents,
    discountCents: row.discount_cents ?? 0,
    experienceCompletedAt: row.experience_completed_at?.toISOString() ?? null,
    customerAttendedAt: row.customer_attended_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function generateBookingCode() {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `HT-${suffix}`;
}

export async function listBookings(): Promise<BookingRecord[]> {
  const rows = await query<BookingRow & { paid_cents: string }>(
    `SELECT b.*, ${bookingExtrasSelect},
            COALESCE(SUM(pay.amount_cents), 0)::text AS paid_cents
     FROM bookings b
     LEFT JOIN booking_payments pay ON pay.booking_id = b.id
     GROUP BY b.id
     ORDER BY b.checkin_at DESC, b.created_at DESC`,
  );
  return rows.map((row) => {
    const { paid_cents, ...bookingRow } = row;
    return attachPaymentSummary(mapBooking(bookingRow as BookingRow), Number(paid_cents));
  });
}

export async function getBookingByCode(bookingCode: string): Promise<BookingRecord | null> {
  const rows = await query<BookingRow & { paid_cents: string }>(
    `SELECT b.*, ${bookingExtrasSelect},
            COALESCE(SUM(pay.amount_cents), 0)::text AS paid_cents
     FROM bookings b
     LEFT JOIN booking_payments pay ON pay.booking_id = b.id
     WHERE UPPER(b.booking_code) = UPPER($1)
     GROUP BY b.id`,
    [bookingCode.trim()],
  );
  if (!rows[0]) {
    return null;
  }
  const { paid_cents, ...bookingRow } = rows[0];
  return attachPaymentSummary(mapBooking(bookingRow as BookingRow), Number(paid_cents));
}

export async function getBookingById(id: string): Promise<BookingRecord | null> {
  const rows = await query<BookingRow & { paid_cents: string }>(
    `SELECT b.*, ${bookingExtrasSelect},
            COALESCE(SUM(pay.amount_cents), 0)::text AS paid_cents
     FROM bookings b
     LEFT JOIN booking_payments pay ON pay.booking_id = b.id
     WHERE b.id = $1
     GROUP BY b.id`,
    [id],
  );
  if (!rows[0]) {
    return null;
  }
  const { paid_cents, ...bookingRow } = rows[0];
  return attachPaymentSummary(mapBooking(bookingRow as BookingRow), Number(paid_cents));
}

export async function createBooking(input: CreateBookingInput): Promise<BookingRecord> {
  const tourRows = await query<{ name: string }>("SELECT name FROM tours WHERE id = $1", [
    input.tourId,
  ]);

  if (!tourRows[0]) {
    throw new Error("El tour seleccionado no existe.");
  }

  let amountCents = input.amountCents ?? null;
  let subtotalCents = input.subtotalCents ?? null;
  let discountCents = input.discountCents ?? 0;
  let promotionId: string | null = input.promotionId ?? null;
  let promoLines: Array<{ promotionId: string; promotionName: string; discountCents: number }> =
    [];

  const promotionIds =
    input.promotionIds?.length
      ? input.promotionIds
      : input.promotionId
        ? [input.promotionId]
        : [];

  if (promotionIds.length) {
    const { tour, result } = await calculateBookingPromotions({
      tourId: input.tourId,
      promotionIds,
      adults: input.adults ?? 1,
      children: input.children ?? 0,
      checkinAt: input.checkinAt,
    });
    amountCents = result.totalCents;
    subtotalCents = result.subtotalCents;
    discountCents = result.discountCents;
    promotionId = result.lines[0]?.promotionId ?? null;
    promoLines = result.lines;
    void tour;
  }

  const bookingCode = generateBookingCode();

  const rows = await query<{ id: string }>(
    `INSERT INTO bookings (
      booking_code, tour_id, tour_name, customer_name, customer_phone, customer_phone_e164,
      customer_email, customer_city, customer_id_type_id, customer_id_number, booking_source,
      checkin_at, amount_cents, currency, adults, children,
      payment_status, approval_status, notes,
      promotion_id, subtotal_cents, discount_cents
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
    RETURNING id`,
    [
      bookingCode,
      input.tourId,
      tourRows[0].name,
      input.customerName.trim(),
      input.customerPhone.trim(),
      input.customerPhoneE164?.trim() || null,
      input.customerEmail?.trim() || null,
      input.customerCity?.trim() || null,
      toNullableUuid(input.customerIdTypeId),
      input.customerIdNumber?.trim() || null,
      input.bookingSource ?? "admin",
      input.checkinAt,
      amountCents,
      input.currency ?? "COP",
      input.adults ?? 1,
      input.children ?? 0,
      input.paymentStatus ?? "pending",
      input.approvalStatus ?? "pending",
      input.notes?.trim() || null,
      toNullableUuid(promotionId) ?? null,
      subtotalCents,
      discountCents,
    ],
  );

  if (promoLines.length) {
    await syncBookingPromotions(rows[0].id, promoLines);
  }

  const created = await getBookingById(rows[0].id);
  return created ?? (() => { throw new Error("Reserva no encontrada."); })();
}

export async function updateBooking(id: string, input: UpdateBookingInput): Promise<BookingRecord> {
  const current = await getBookingById(id);
  if (!current) {
    throw new Error("Reserva no encontrada.");
  }

  let tourName = current.tourName;
  let tourId = current.tourId;

  if (input.tourId) {
    const tourRows = await query<{ name: string }>("SELECT name FROM tours WHERE id = $1", [
      input.tourId,
    ]);
    if (!tourRows[0]) {
      throw new Error("El tour seleccionado no existe.");
    }
    tourId = input.tourId;
    tourName = tourRows[0].name;
  }

  let amountCents = input.amountCents !== undefined ? input.amountCents : current.amountCents;
  let subtotalCents =
    input.subtotalCents !== undefined ? input.subtotalCents : current.subtotalCents;
  let discountCents = input.discountCents ?? current.discountCents;
  let promotionId = input.promotionId !== undefined ? input.promotionId : current.promotionId;

  const promotionIds = input.promotionIds;
  if (promotionIds !== undefined && tourId) {
    if (promotionIds.length) {
      const { result } = await calculateBookingPromotions({
        tourId,
        promotionIds,
        adults: input.adults ?? current.adults,
        children: input.children ?? current.children,
        checkinAt: input.checkinAt ?? current.checkinAt,
      });
      amountCents = result.totalCents;
      subtotalCents = result.subtotalCents;
      discountCents = result.discountCents;
      promotionId = result.lines[0]?.promotionId ?? null;
      await syncBookingPromotions(id, result.lines);
    } else {
      await syncBookingPromotions(id, []);
      promotionId = null;
      discountCents = 0;
    }
  }

  const attendedAt =
    input.customerAttendedAt === null
      ? null
      : input.customerAttendedAt !== undefined
        ? input.customerAttendedAt
        : current.customerAttendedAt;

  await query(
    `UPDATE bookings SET
      tour_id = $2, tour_name = $3, customer_name = $4, customer_phone = $5,
      customer_phone_e164 = $6, customer_email = $7, customer_city = $8,
      customer_id_type_id = $9, customer_id_number = $10, booking_source = $11,
      checkin_at = $12, amount_cents = $13, currency = $14,
      adults = $15, children = $16, payment_status = $17, approval_status = $18,
      notes = $19, promotion_id = $20, subtotal_cents = $21, discount_cents = $22,
      customer_attended_at = $23,
      updated_at = NOW()
    WHERE id = $1`,
    [
      id,
      tourId,
      tourName,
      input.customerName ?? current.customerName,
      input.customerPhone ?? current.customerPhone,
      input.customerPhoneE164 !== undefined ? input.customerPhoneE164 : current.customerPhoneE164,
      input.customerEmail !== undefined ? input.customerEmail : current.customerEmail,
      input.customerCity !== undefined ? input.customerCity : current.customerCity,
      input.customerIdTypeId !== undefined
        ? toNullableUuid(input.customerIdTypeId)
        : current.customerIdTypeId,
      input.customerIdNumber !== undefined ? input.customerIdNumber : current.customerIdNumber,
      input.bookingSource ?? current.bookingSource,
      input.checkinAt ?? current.checkinAt,
      amountCents,
      input.currency ?? current.currency,
      input.adults ?? current.adults,
      input.children ?? current.children,
      input.paymentStatus ?? current.paymentStatus,
      input.approvalStatus ?? current.approvalStatus,
      input.notes !== undefined ? input.notes : current.notes,
      toNullableUuid(promotionId) ?? null,
      subtotalCents,
      discountCents,
      attendedAt,
    ],
  );

  const updated = await getBookingById(id);
  return updated ?? (() => { throw new Error("Reserva no encontrada."); })();
}

export async function deleteBooking(id: string) {
  await query("DELETE FROM bookings WHERE id = $1", [id]);
}

export async function getBookingStats() {
  const rows = await query<{
    total: string;
    pending_approval: string;
    confirmed: string;
    cancelled: string;
    attended: string;
    travelers_attended: string;
  }>(`
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE approval_status = 'pending')::text AS pending_approval,
      COUNT(*) FILTER (WHERE approval_status = 'confirmed')::text AS confirmed,
      COUNT(*) FILTER (WHERE approval_status = 'cancelled')::text AS cancelled,
      COUNT(*) FILTER (WHERE customer_attended_at IS NOT NULL)::text AS attended,
      COALESCE(SUM(adults + children) FILTER (WHERE customer_attended_at IS NOT NULL), 0)::text AS travelers_attended
    FROM bookings
  `);

  return {
    total: Number(rows[0]?.total ?? 0),
    pendingApproval: Number(rows[0]?.pending_approval ?? 0),
    confirmed: Number(rows[0]?.confirmed ?? 0),
    cancelled: Number(rows[0]?.cancelled ?? 0),
    attended: Number(rows[0]?.attended ?? 0),
    travelersAttended: Number(rows[0]?.travelers_attended ?? 0),
  };
}

export async function setBookingAttended(bookingId: string, attended: boolean): Promise<BookingRecord> {
  return updateBooking(bookingId, {
    customerAttendedAt: attended ? new Date().toISOString() : null,
  });
}
