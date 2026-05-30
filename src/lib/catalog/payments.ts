import { query } from "@/lib/db";
import { getBookingById, updateBooking } from "@/lib/catalog/bookings";
import { formatMoneyDisplay, parseMoneyInput } from "@/lib/catalog/money";
import type {
  BookingPaymentRecord,
  BookingRecord,
  BookingWithPayments,
  CreateBookingPaymentInput,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/catalog/types";

const VALID_METHODS = new Set<PaymentMethod>([
  "transferencia",
  "consignacion",
  "efectivo",
  "nequi",
  "daviplata",
  "tarjeta",
  "paypal",
  "otro",
]);

type PaymentRow = {
  id: string;
  booking_id: string;
  amount_cents: number;
  currency: string;
  payment_method: PaymentMethod;
  reference: string | null;
  voucher_url: string | null;
  notes: string | null;
  paid_at: Date;
  created_at: Date;
};

function mapPayment(row: PaymentRow): BookingPaymentRecord {
  return {
    id: row.id,
    bookingId: row.booking_id,
    amountCents: row.amount_cents,
    currency: row.currency,
    paymentMethod: row.payment_method,
    reference: row.reference,
    voucherUrl: row.voucher_url,
    notes: row.notes,
    paidAt: row.paid_at.toISOString(),
    createdAt: row.created_at.toISOString(),
  };
}

export async function sumPaidForBooking(bookingId: string): Promise<number> {
  const rows = await query<{ total: string }>(
    `SELECT COALESCE(SUM(amount_cents), 0)::text AS total
     FROM booking_payments WHERE booking_id = $1`,
    [bookingId],
  );
  return Number(rows[0]?.total ?? 0);
}

export function derivePaymentStatus(
  totalCents: number | null,
  paidCents: number,
): PaymentStatus {
  if (paidCents <= 0) {
    return "pending";
  }
  if (totalCents === null || totalCents <= 0) {
    return "partial";
  }
  if (paidCents >= totalCents) {
    return "paid";
  }
  return "partial";
}

export function attachPaymentSummary(
  booking: Omit<BookingRecord, "paidCents" | "balanceCents">,
  paidCents: number,
): BookingRecord {
  const balanceCents =
    booking.amountCents !== null ? Math.max(booking.amountCents - paidCents, 0) : null;
  const paymentStatus = derivePaymentStatus(booking.amountCents, paidCents);
  return {
    ...booking,
    paidCents,
    balanceCents,
    paymentStatus,
  };
}

export async function syncBookingPaymentStatus(bookingId: string): Promise<BookingRecord | null> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    return null;
  }
  const paidCents = await sumPaidForBooking(bookingId);
  const paymentStatus = derivePaymentStatus(booking.amountCents, paidCents);
  return updateBooking(bookingId, { paymentStatus });
}

export async function listPaymentsForBooking(bookingId: string): Promise<BookingPaymentRecord[]> {
  const rows = await query<PaymentRow>(
    `SELECT * FROM booking_payments WHERE booking_id = $1 ORDER BY paid_at DESC, created_at DESC`,
    [bookingId],
  );
  return rows.map(mapPayment);
}

export async function getBookingWithPayments(bookingId: string): Promise<BookingWithPayments | null> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    return null;
  }
  const payments = await listPaymentsForBooking(bookingId);
  const paidCents = payments.reduce((sum, payment) => sum + payment.amountCents, 0);
  return {
    booking: attachPaymentSummary(booking, paidCents),
    payments,
  };
}

export async function createBookingPayment(
  bookingId: string,
  input: CreateBookingPaymentInput,
): Promise<BookingWithPayments> {
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error("Reserva no encontrada.");
  }

  if (!VALID_METHODS.has(input.paymentMethod)) {
    throw new Error("Método de pago no válido.");
  }

  const amountCents = parseMoneyInput(input.amount, booking.currency);
  const paidCents = await sumPaidForBooking(bookingId);

  if (booking.amountCents !== null && booking.amountCents > 0) {
    const balance = booking.amountCents - paidCents;
    if (amountCents > balance) {
      throw new Error(
        `El abono supera el saldo pendiente (${formatMoneyDisplay(balance, booking.currency)}).`,
      );
    }
  }

  const paidAt = input.paidAt ? new Date(input.paidAt).toISOString() : new Date().toISOString();

  const rows = await query<PaymentRow>(
    `INSERT INTO booking_payments (
      booking_id, amount_cents, currency, payment_method, reference, voucher_url, notes, paid_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      bookingId,
      amountCents,
      booking.currency,
      input.paymentMethod,
      input.reference?.trim() || null,
      input.voucherUrl?.trim() || null,
      input.notes?.trim() || null,
      paidAt,
    ],
  );

  if (!rows[0]) {
    throw new Error("No fue posible registrar el pago.");
  }

  await syncBookingPaymentStatus(bookingId);
  const result = await getBookingWithPayments(bookingId);
  if (!result) {
    throw new Error("Reserva no encontrada.");
  }
  return result;
}

export type PaymentListFilters = {
  from?: string;
  to?: string;
  paymentMethod?: PaymentMethod;
  currency?: string;
};

export type PaymentListItem = BookingPaymentRecord & {
  bookingCode: string;
  customerName: string;
  tourName: string;
};

export type PaymentsCashReport = {
  totalCount: number;
  totalsByCurrency: Array<{ currency: string; totalCents: number }>;
  totalsByMethod: Array<{ paymentMethod: PaymentMethod; currency: string; totalCents: number; count: number }>;
};

function buildPaymentFilters(filters: PaymentListFilters) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.from) {
    values.push(filters.from);
    conditions.push(`p.paid_at >= $${values.length}::timestamptz`);
  }
  if (filters.to) {
    values.push(filters.to);
    conditions.push(`p.paid_at <= $${values.length}::timestamptz`);
  }
  if (filters.paymentMethod) {
    values.push(filters.paymentMethod);
    conditions.push(`p.payment_method = $${values.length}`);
  }
  if (filters.currency) {
    values.push(filters.currency);
    conditions.push(`p.currency = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { where, values };
}

type PaymentListRow = PaymentRow & {
  booking_code: string;
  customer_name: string;
  tour_name: string;
};

export async function listAllPayments(filters: PaymentListFilters = {}): Promise<PaymentListItem[]> {
  const { where, values } = buildPaymentFilters(filters);
  const rows = await query<PaymentListRow>(
    `SELECT p.*, b.booking_code, b.customer_name, b.tour_name
     FROM booking_payments p
     JOIN bookings b ON b.id = p.booking_id
     ${where}
     ORDER BY p.paid_at DESC, p.created_at DESC`,
    values,
  );

  return rows.map((row) => ({
    ...mapPayment(row),
    bookingCode: row.booking_code,
    customerName: row.customer_name,
    tourName: row.tour_name,
  }));
}

export async function getPaymentsCashReport(filters: PaymentListFilters = {}): Promise<PaymentsCashReport> {
  const { where, values } = buildPaymentFilters(filters);

  const [countRows, currencyRows, methodRows] = await Promise.all([
    query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM booking_payments p ${where}`,
      values,
    ),
    query<{ currency: string; total: string }>(
      `SELECT p.currency, COALESCE(SUM(p.amount_cents), 0)::text AS total
       FROM booking_payments p ${where}
       GROUP BY p.currency ORDER BY p.currency`,
      values,
    ),
    query<{ payment_method: PaymentMethod; currency: string; total: string; count: string }>(
      `SELECT p.payment_method, p.currency,
              COALESCE(SUM(p.amount_cents), 0)::text AS total,
              COUNT(*)::text AS count
       FROM booking_payments p ${where}
       GROUP BY p.payment_method, p.currency
       ORDER BY p.currency, p.payment_method`,
      values,
    ),
  ]);

  return {
    totalCount: Number(countRows[0]?.total ?? 0),
    totalsByCurrency: currencyRows.map((row) => ({
      currency: row.currency,
      totalCents: Number(row.total),
    })),
    totalsByMethod: methodRows.map((row) => ({
      paymentMethod: row.payment_method,
      currency: row.currency,
      totalCents: Number(row.total),
      count: Number(row.count),
    })),
  };
}

export async function deleteBookingPayment(bookingId: string, paymentId: string): Promise<BookingWithPayments> {
  const result = await query(
    "DELETE FROM booking_payments WHERE id = $1 AND booking_id = $2 RETURNING id",
    [paymentId, bookingId],
  );
  if (!result.length) {
    throw new Error("Pago no encontrado.");
  }
  await syncBookingPaymentStatus(bookingId);
  const updated = await getBookingWithPayments(bookingId);
  if (!updated) {
    throw new Error("Reserva no encontrada.");
  }
  return updated;
}
