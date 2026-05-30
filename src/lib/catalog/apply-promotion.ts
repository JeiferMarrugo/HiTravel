import { parseMoneyInput } from "@/lib/catalog/money";
import type { PromotionConfig, PromotionType } from "@/lib/catalog/promotion-types";
import type { PricingSeason, PromotionRecord } from "@/lib/catalog/types";

export type PriceEstimateInput = {
  priceFromCents: number;
  currency: string;
  pricingSeasons: PricingSeason[];
  adults: number;
  children: number;
};

export type PriceEstimate = {
  subtotalCents: number;
  adultUnitCents: number;
  childUnitCents: number;
  currency: string;
};

export type ApplyPromotionInput = {
  promotion: Pick<PromotionRecord, "id" | "name" | "promotionType" | "config" | "validFrom" | "validUntil">;
  estimate: PriceEstimate;
  adults: number;
  children: number;
  checkinAt: string;
  tourId?: string | null;
  promotionTourIds?: string[] | null;
  runningSubtotalCents: number;
  unitState: UnitDiscountState;
};

export type UnitDiscountState = {
  freeChildrenUsed: number;
  secondAdultUsed: boolean;
  secondChildUsed: boolean;
};

export type AppliedPromotionLine = {
  promotionId: string;
  promotionName: string;
  promotionType: PromotionType;
  discountCents: number;
  description: string;
};

export type ApplyPromotionResult = {
  discountCents: number;
  description: string;
  unitState: UnitDiscountState;
};

export type ApplyPromotionsResult = {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  lines: AppliedPromotionLine[];
  descriptions: string[];
};

const STACK_ORDER: PromotionType[] = [
  "free_child",
  "second_passenger_discount",
  "fixed_discount",
  "group_discount",
  "early_booking",
  "percent_discount",
];

function pickSeasonPricing(seasons: PricingSeason[], priceFromCents: number) {
  const season = seasons[0];
  if (season) {
    return {
      adultUnitCents: season.adultPriceCents,
      childUnitCents: season.childPriceCents,
    };
  }
  return {
    adultUnitCents: priceFromCents,
    childUnitCents: Math.round(priceFromCents * 0.7),
  };
}

export function estimateBookingSubtotal(input: PriceEstimateInput): PriceEstimate {
  const { adultUnitCents, childUnitCents } = pickSeasonPricing(
    input.pricingSeasons,
    input.priceFromCents,
  );
  const subtotalCents =
    adultUnitCents * Math.max(input.adults, 0) + childUnitCents * Math.max(input.children, 0);

  return {
    subtotalCents,
    adultUnitCents,
    childUnitCents,
    currency: input.currency,
  };
}

function isPromotionValidForTour(
  tourId: string | null | undefined,
  promotionTourIds: string[] | null | undefined,
): boolean {
  if (!promotionTourIds?.length) {
    return true;
  }
  if (!tourId) {
    return false;
  }
  return promotionTourIds.includes(tourId);
}

function isWithinValidity(
  validFrom: string | null,
  validUntil: string | null,
  checkinAt: string,
): boolean {
  const checkin = new Date(checkinAt).getTime();
  if (validFrom && checkin < new Date(validFrom).getTime()) {
    return false;
  }
  if (validUntil && checkin > new Date(validUntil).getTime()) {
    return false;
  }
  return true;
}

function sortPromotionsForStack<T extends { promotionType: PromotionType }>(promotions: T[]): T[] {
  return [...promotions].sort(
    (a, b) => STACK_ORDER.indexOf(a.promotionType) - STACK_ORDER.indexOf(b.promotionType),
  );
}

export function applyPromotion(input: ApplyPromotionInput): ApplyPromotionResult {
  const { promotion, estimate, adults, children, checkinAt, runningSubtotalCents, unitState } =
    input;
  const config = promotion.config as PromotionConfig;

  if (!isPromotionValidForTour(input.tourId, input.promotionTourIds)) {
    throw new Error(`«${promotion.name}» no aplica al tour seleccionado.`);
  }

  if (!isWithinValidity(promotion.validFrom, promotion.validUntil, checkinAt)) {
    throw new Error(`«${promotion.name}» no está vigente para la fecha de salida.`);
  }

  if (runningSubtotalCents <= 0) {
    throw new Error("Ya no queda saldo al que aplicar más promociones.");
  }

  let discountCents = 0;
  let description = "";
  const nextState: UnitDiscountState = { ...unitState };

  switch (promotion.promotionType as PromotionType) {
    case "percent_discount": {
      const percent = Math.min(100, Math.max(0, Number(config.percent) || 0));
      discountCents = Math.round((runningSubtotalCents * percent) / 100);
      description = `${percent}%`;
      break;
    }
    case "fixed_discount": {
      const amount = Number(config.amount) || 0;
      const currency = config.currency ?? estimate.currency;
      if (currency !== estimate.currency) {
        throw new Error(`«${promotion.name}»: la moneda del descuento no coincide con el tour.`);
      }
      discountCents = Math.min(parseMoneyInput(amount, currency), runningSubtotalCents);
      description = "Monto fijo";
      break;
    }
    case "free_child": {
      const freeChildren = Math.max(1, Math.floor(Number(config.freeChildren) || 1));
      const remainingChildren = Math.max(children - unitState.freeChildrenUsed, 0);
      const toWaive = Math.min(remainingChildren, freeChildren);
      if (toWaive <= 0) {
        throw new Error(`«${promotion.name}»: no quedan niños a los que aplicar el beneficio.`);
      }
      discountCents = toWaive * estimate.childUnitCents;
      nextState.freeChildrenUsed += toWaive;
      description = `${toWaive} niño(s) gratis`;
      break;
    }
    case "second_passenger_discount": {
      const percent = Math.min(100, Math.max(0, Number(config.percent) || 50));
      const isChild = config.passengerType === "child";
      if (isChild) {
        if (children < 2 || unitState.secondChildUsed) {
          throw new Error(`«${promotion.name}»: requiere 2+ niños y no haber usado ya este beneficio.`);
        }
        discountCents = Math.round((estimate.childUnitCents * percent) / 100);
        nextState.secondChildUsed = true;
        description = `2.º niño -${percent}%`;
      } else {
        if (adults < 2 || unitState.secondAdultUsed) {
          throw new Error(`«${promotion.name}»: requiere 2+ adultos y no haber usado ya este beneficio.`);
        }
        discountCents = Math.round((estimate.adultUnitCents * percent) / 100);
        nextState.secondAdultUsed = true;
        description = `2.º adulto -${percent}%`;
      }
      break;
    }
    case "group_discount": {
      const minPeople = Math.max(2, Math.floor(Number(config.minPeople) || 4));
      const totalPeople = adults + children;
      if (totalPeople < minPeople) {
        throw new Error(`«${promotion.name}»: se requieren al menos ${minPeople} personas.`);
      }
      const percent = Math.min(100, Math.max(0, Number(config.percent) || 0));
      discountCents = Math.round((runningSubtotalCents * percent) / 100);
      description = `Grupo ${minPeople}+ (-${percent}%)`;
      break;
    }
    case "early_booking": {
      const minDays = Math.max(1, Math.floor(Number(config.minDaysAhead) || 14));
      const daysAhead = Math.floor(
        (new Date(checkinAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );
      if (daysAhead < minDays) {
        throw new Error(`«${promotion.name}»: la salida debe ser al menos ${minDays} días después de hoy.`);
      }
      const percent = Math.min(100, Math.max(0, Number(config.percent) || 0));
      discountCents = Math.round((runningSubtotalCents * percent) / 100);
      description = `Anticipada (-${percent}%)`;
      break;
    }
    default:
      throw new Error("Tipo de promoción no soportado.");
  }

  discountCents = Math.min(Math.max(0, discountCents), runningSubtotalCents);

  return { discountCents, description, unitState: nextState };
}

export function applyPromotions(input: {
  promotions: Array<
    Pick<PromotionRecord, "id" | "name" | "promotionType" | "config" | "validFrom" | "validUntil" | "tourIds">
  >;
  estimate: PriceEstimate;
  adults: number;
  children: number;
  checkinAt: string;
  tourId?: string | null;
}): ApplyPromotionsResult {
  if (!input.promotions.length) {
    throw new Error("Selecciona al menos una promoción.");
  }

  const subtotalCents = input.estimate.subtotalCents;
  let runningSubtotalCents = subtotalCents;
  let unitState: UnitDiscountState = {
    freeChildrenUsed: 0,
    secondAdultUsed: false,
    secondChildUsed: false,
  };
  const lines: AppliedPromotionLine[] = [];

  for (const promotion of sortPromotionsForStack(input.promotions)) {
    const result = applyPromotion({
      promotion,
      estimate: input.estimate,
      adults: input.adults,
      children: input.children,
      checkinAt: input.checkinAt,
      tourId: input.tourId,
      promotionTourIds: promotion.tourIds,
      runningSubtotalCents,
      unitState,
    });

    if (result.discountCents > 0) {
      lines.push({
        promotionId: promotion.id,
        promotionName: promotion.name,
        promotionType: promotion.promotionType,
        discountCents: result.discountCents,
        description: result.description,
      });
      runningSubtotalCents -= result.discountCents;
      unitState = result.unitState;
    }
  }

  const discountCents = subtotalCents - runningSubtotalCents;
  const totalCents = Math.max(runningSubtotalCents, 0);

  return {
    subtotalCents,
    discountCents,
    totalCents,
    lines,
    descriptions: lines.map((line) => `${line.promotionName}: ${line.description}`),
  };
}

/** Aplica promociones activas omitiendo las que no califican (sitio público). */
export function applyPromotionsLenient(input: {
  promotions: Array<
    Pick<PromotionRecord, "id" | "name" | "promotionType" | "config" | "validFrom" | "validUntil" | "tourIds">
  >;
  estimate: PriceEstimate;
  adults: number;
  children: number;
  checkinAt: string;
  tourId?: string | null;
}): ApplyPromotionsResult {
  const subtotalCents = input.estimate.subtotalCents;
  let runningSubtotalCents = subtotalCents;
  let unitState: UnitDiscountState = {
    freeChildrenUsed: 0,
    secondAdultUsed: false,
    secondChildUsed: false,
  };
  const lines: AppliedPromotionLine[] = [];

  for (const promotion of sortPromotionsForStack(input.promotions)) {
    try {
      const result = applyPromotion({
        promotion,
        estimate: input.estimate,
        adults: input.adults,
        children: input.children,
        checkinAt: input.checkinAt,
        tourId: input.tourId,
        promotionTourIds: promotion.tourIds,
        runningSubtotalCents,
        unitState,
      });

      if (result.discountCents > 0) {
        lines.push({
          promotionId: promotion.id,
          promotionName: promotion.name,
          promotionType: promotion.promotionType,
          discountCents: result.discountCents,
          description: result.description,
        });
        runningSubtotalCents -= result.discountCents;
        unitState = result.unitState;
      }
    } catch {
      /* promoción no aplica a este pasajero/fecha */
    }
  }

  const discountCents = subtotalCents - runningSubtotalCents;
  const totalCents = Math.max(runningSubtotalCents, 0);

  return {
    subtotalCents,
    discountCents,
    totalCents,
    lines,
    descriptions: lines.map((line) => `${line.promotionName}: ${line.description}`),
  };
}
