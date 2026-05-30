import { applyPromotions, estimateBookingSubtotal } from "@/lib/catalog/apply-promotion";
import { getPromotionsByIds } from "@/lib/catalog/promotions";
import { getTourById } from "@/lib/catalog/tours";

export async function calculateBookingPromotions(input: {
  tourId: string;
  promotionIds: string[];
  adults: number;
  children: number;
  checkinAt: string;
}) {
  const uniqueIds = [...new Set(input.promotionIds.filter(Boolean))];
  if (!uniqueIds.length) {
    throw new Error("Selecciona al menos una promoción.");
  }

  const [tour, promotions] = await Promise.all([
    getTourById(input.tourId),
    getPromotionsByIds(uniqueIds),
  ]);

  if (!tour) {
    throw new Error("Tour no encontrado.");
  }

  if (promotions.length !== uniqueIds.length) {
    throw new Error("Una o más promociones no existen.");
  }

  const inactive = promotions.filter((p) => !p.isActive);
  if (inactive.length) {
    throw new Error(`Promoción inactiva: ${inactive.map((p) => p.name).join(", ")}`);
  }

  const estimate = estimateBookingSubtotal({
    priceFromCents: tour.priceFromCents,
    currency: tour.currency,
    pricingSeasons: tour.pricingSeasons,
    adults: input.adults,
    children: input.children,
  });

  const result = applyPromotions({
    promotions,
    estimate,
    adults: input.adults,
    children: input.children,
    checkinAt: new Date(input.checkinAt).toISOString(),
    tourId: input.tourId,
  });

  return { tour, result };
}
