import { query } from "@/lib/db";
import type { AppliedPromotion } from "@/lib/catalog/types";

type BookingPromotionRow = {
  promotion_id: string;
  promotion_name: string;
  discount_cents: number;
  sort_order: number;
};

export function mapAppliedPromotion(row: BookingPromotionRow): AppliedPromotion {
  return {
    promotionId: row.promotion_id,
    promotionName: row.promotion_name,
    discountCents: row.discount_cents,
  };
}

export async function listBookingPromotions(bookingId: string): Promise<AppliedPromotion[]> {
  const rows = await query<BookingPromotionRow>(
    `SELECT promotion_id, promotion_name, discount_cents, sort_order
     FROM booking_promotions
     WHERE booking_id = $1
     ORDER BY sort_order ASC, promotion_name ASC`,
    [bookingId],
  );
  return rows.map(mapAppliedPromotion);
}

export async function syncBookingPromotions(
  bookingId: string,
  lines: Array<{ promotionId: string; promotionName: string; discountCents: number }>,
) {
  await query("DELETE FROM booking_promotions WHERE booking_id = $1", [bookingId]);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    await query(
      `INSERT INTO booking_promotions (
        booking_id, promotion_id, promotion_name, discount_cents, sort_order
      ) VALUES ($1,$2,$3,$4,$5)`,
      [bookingId, line.promotionId, line.promotionName, line.discountCents, index],
    );
  }

  const firstId = lines[0]?.promotionId ?? null;
  const totalDiscount = lines.reduce((sum, line) => sum + line.discountCents, 0);

  await query(
    `UPDATE bookings SET promotion_id = $2, discount_cents = $3, updated_at = NOW() WHERE id = $1`,
    [bookingId, firstId, totalDiscount],
  );
}
