export type PromotionType =
  | "percent_discount"
  | "fixed_discount"
  | "free_child"
  | "second_passenger_discount"
  | "group_discount"
  | "early_booking";

export const PROMOTION_TYPE_OPTIONS: {
  value: PromotionType;
  label: string;
  description: string;
}[] = [
  {
    value: "percent_discount",
    label: "Descuento porcentual",
    description: "Porcentaje de descuento sobre el subtotal (ej. 15%).",
  },
  {
    value: "fixed_discount",
    label: "Descuento fijo",
    description: "Monto fijo en pesos o dólares que se resta del total.",
  },
  {
    value: "free_child",
    label: "Niño(s) gratis",
    description: "Uno o más menores no pagan (se descuenta su tarifa).",
  },
  {
    value: "second_passenger_discount",
    label: "Segundo pasajero con descuento",
    description: "Descuento en el 2.º adulto o 2.º niño (ej. 50% off).",
  },
  {
    value: "group_discount",
    label: "Descuento por grupo",
    description: "Si hay N personas o más, aplica un % de descuento.",
  },
  {
    value: "early_booking",
    label: "Reserva anticipada",
    description: "Descuento si la salida es con X días de anticipación.",
  },
];

export type PromotionConfig = {
  percent?: number;
  amount?: number;
  currency?: string;
  freeChildren?: number;
  passengerType?: "adult" | "child";
  minPeople?: number;
  minDaysAhead?: number;
};

export const DEFAULT_PROMOTION_CONFIG: Record<PromotionType, PromotionConfig> = {
  percent_discount: { percent: 10 },
  fixed_discount: { amount: 50000, currency: "COP" },
  free_child: { freeChildren: 1 },
  second_passenger_discount: { percent: 50, passengerType: "adult" },
  group_discount: { minPeople: 4, percent: 10 },
  early_booking: { percent: 5, minDaysAhead: 14 },
};

export function promotionTypeLabel(type: PromotionType): string {
  return PROMOTION_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type;
}

export function summarizePromotionConfig(type: PromotionType, config: PromotionConfig): string {
  switch (type) {
    case "percent_discount":
      return `${config.percent ?? 0}% de descuento`;
    case "fixed_discount":
      return `-${config.amount ?? 0} ${config.currency ?? "COP"}`;
    case "free_child":
      return `${config.freeChildren ?? 1} niño(s) gratis`;
    case "second_passenger_discount":
      return `2.º ${config.passengerType === "child" ? "niño" : "adulto"} al ${config.percent ?? 50}%`;
    case "group_discount":
      return `${config.minPeople ?? 0}+ personas → ${config.percent ?? 0}%`;
    case "early_booking":
      return `${config.minDaysAhead ?? 0} días antes → ${config.percent ?? 0}%`;
    default:
      return "";
  }
}
