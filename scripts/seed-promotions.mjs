import pg from "pg";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

const defaults = [
  {
    slug: "descuento-15",
    name: "Descuento 15%",
    description: "Quince por ciento de descuento sobre el subtotal de la reserva.",
    promotion_type: "percent_discount",
    config: { percent: 15 },
    sort_order: 10,
  },
  {
    slug: "nino-gratis",
    name: "1 niño gratis",
    description: "Un menor no paga (se descuenta el valor de un niño del subtotal).",
    promotion_type: "free_child",
    config: { freeChildren: 1 },
    sort_order: 20,
  },
  {
    slug: "segundo-adulto-50",
    name: "Segundo adulto 50%",
    description: "El segundo adulto paga la mitad del precio de adulto.",
    promotion_type: "second_passenger_discount",
    config: { percent: 50, passengerType: "adult" },
    sort_order: 30,
  },
  {
    slug: "grupo-4-10",
    name: "Grupo 4+ personas (10%)",
    description: "Diez por ciento de descuento si viajan 4 o más personas.",
    promotion_type: "group_discount",
    config: { minPeople: 4, percent: 10 },
    sort_order: 40,
  },
  {
    slug: "descuento-fijo-50k",
    name: "Descuento fijo $50.000 COP",
    description: "Cincuenta mil pesos de descuento sobre el total (moneda COP).",
    promotion_type: "fixed_discount",
    config: { amount: 50000, currency: "COP" },
    sort_order: 50,
  },
  {
    slug: "reserva-anticipada",
    name: "Reserva anticipada 5%",
    description: "Cinco por ciento si la salida es con al menos 14 días de anticipación.",
    promotion_type: "early_booking",
    config: { percent: 5, minDaysAhead: 14 },
    sort_order: 60,
  },
];

const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();

  for (const promo of defaults) {
    await client.query(
      `INSERT INTO promotions (slug, name, description, promotion_type, config, sort_order)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       ON CONFLICT (slug) DO NOTHING`,
      [promo.slug, promo.name, promo.description, promo.promotion_type, JSON.stringify(promo.config), promo.sort_order],
    );
  }

  console.log("Promociones por defecto listas.");
} catch (error) {
  console.error("No fue posible sembrar promociones:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
