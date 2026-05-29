import type { RateSeason } from "@/lib/admin/types";

export const rateSummaryCards = [
  { label: "Tarifa promedio", value: "$108", icon: "payments" },
  { label: "Tours con temporada", value: "18", icon: "event" },
  { label: "Cambios este mes", value: "12", icon: "sync" },
];

export const rateTable: RateSeason[] = [
  { id: "rate-1", season: "Alta temporada (Dic - Ene)", adultPrice: "$120", childPrice: "$85" },
  { id: "rate-2", season: "Semana Santa", adultPrice: "$135", childPrice: "$95" },
  { id: "rate-3", season: "Media temporada (Jun - Ago)", adultPrice: "$110", childPrice: "$78" },
  { id: "rate-4", season: "Baja temporada (Feb - Nov)", adultPrice: "$95", childPrice: "$60" },
];
