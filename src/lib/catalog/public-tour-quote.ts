import { applyPromotionsLenient, estimateBookingSubtotal } from "@/lib/catalog/apply-promotion";
import { listPromotions } from "@/lib/catalog/promotions";
import { getTourBySlug } from "@/lib/catalog/tours";
import type { PricingSeason } from "@/lib/catalog/types";

export type PublicTourQuote = {
  tourId: string;
  currency: string;
  adults: number;
  children: number;
  checkinAt: string;
  adultUnitCents: number;
  childUnitCents: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  promotionBadge: string | null;
  lines: Array<{
    promotionName: string;
    description: string;
    discountCents: number;
  }>;
};

function promotionAppliesToTour(
  tourIds: string[] | null | undefined,
  tourId: string,
): boolean {
  if (!tourIds?.length) {
    return true;
  }
  return tourIds.includes(tourId);
}

function defaultCheckinAt(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function buildPromotionBadge(
  discountCents: number,
  subtotalCents: number,
  lines: PublicTourQuote["lines"],
): string | null {
  if (discountCents <= 0 || subtotalCents <= 0) {
    return null;
  }

  const percentLine = lines.find((line) => line.description.endsWith("%"));
  if (percentLine) {
    const match = percentLine.description.match(/(\d+(?:\.\d+)?)\s*%/);
    if (match) {
      return `AHORRA ${Math.round(Number(match[1]))}%`;
    }
  }

  const percentSaved = Math.round((discountCents / subtotalCents) * 100);
  if (percentSaved > 0) {
    return `AHORRA ${percentSaved}%`;
  }

  return "Descuento";
}

export async function quotePublicTour(input: {
  slug: string;
  adults?: number;
  children?: number;
  checkinAt?: string;
}): Promise<PublicTourQuote | null> {
  const tour = await getTourBySlug(input.slug);
  if (!tour || !tour.isActive) {
    return null;
  }

  const adults = Math.min(20, Math.max(1, Math.floor(input.adults ?? 2)));
  const children = Math.min(10, Math.max(0, Math.floor(input.children ?? 0)));
  const checkinAt = input.checkinAt?.trim() || defaultCheckinAt();

  const estimate = estimateBookingSubtotal({
    priceFromCents: tour.priceFromCents,
    currency: tour.currency,
    pricingSeasons: tour.pricingSeasons as PricingSeason[],
    adults,
    children,
  });

  const allPromotions = await listPromotions({ activeOnly: true });
  const applicable = allPromotions.filter((promotion) =>
    promotionAppliesToTour(promotion.tourIds, tour.id),
  );

  const result = applyPromotionsLenient({
    promotions: applicable,
    estimate,
    adults,
    children,
    checkinAt: new Date(checkinAt).toISOString(),
    tourId: tour.id,
  });

  const lines = result.lines.map((line) => ({
    promotionName: line.promotionName,
    description: line.description,
    discountCents: line.discountCents,
  }));

  return {
    tourId: tour.id,
    currency: tour.currency,
    adults,
    children,
    checkinAt,
    adultUnitCents: estimate.adultUnitCents,
    childUnitCents: estimate.childUnitCents,
    subtotalCents: result.subtotalCents,
    discountCents: result.discountCents,
    totalCents: result.totalCents,
    promotionBadge: buildPromotionBadge(result.discountCents, result.subtotalCents, lines),
    lines,
  };
}
