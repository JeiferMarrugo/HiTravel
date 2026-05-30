import pg from "pg";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles();

if (process.env.SEED_CATALOG_DEMO !== "true") {
  console.log(
    "Seed de demo omitido. Solo se usan experiencias del panel admin. Para datos de ejemplo: SEED_CATALOG_DEMO=true npm run db:seed-catalog",
  );
  process.exit(0);
}

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Falta DATABASE_URL.");
  process.exit(1);
}

const tours = [
  {
    slug: "rosario-vip",
    name: "Islas del Rosario: Experiencia Elite en Beach Club",
    category: "Pasadía VIP",
    packageType: "pasadia",
    badge: "Destacado",
    country: "Colombia",
    location: "Cartagena, Colombia",
    shortDescription:
      "Escapa del ritmo de Cartagena y sumérgete en las aguas cristalinas de las Islas del Rosario.",
    description:
      "Pasadía VIP con transporte premium, beach club exclusivo, snorkel y almuerzo caribeño todo incluido.",
    longDescription: [
      "Escapa del ritmo de Cartagena y sumérgete en las aguas cristalinas de las Islas del Rosario.",
      "Diseñado para quienes buscan equilibrio entre aventura tropical y comodidad de alto nivel.",
    ],
    priceFromCents: 12000,
    currency: "USD",
    rating: 4.9,
    reviewsCount: 128,
    durationLabel: "8 horas",
    groupSizeLabel: "Máx. 15",
    languages: "ES / EN",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBulXF4F-edw9gRu9Sdq7WXDV6bRucsihRtX4RAR-7PMpunXy5CySeLUk3tJFMWOTVClDCRfGIKQwrrw7Bx9nViGmBQ-cuuFqLnwjzyUWbuhPoz2iBIJzzL9n9oz8R90N0QRpbGROAVnK3n43xA1vekb2Llay0RvmUkgonCpBO1BvqgNjJP6EWysqm3ulu0mEezGwQW2TkI9pWr2oSZ0PMiUHIAIJcEekCY3B12iI4fzwlc-SkT6PPP75YA9uZApHJ0d6m6zXGt0g",
    gallery: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBulXF4F-edw9gRu9Sdq7WXDV6bRucsihRtX4RAR-7PMpunXy5CySeLUk3tJFMWOTVClDCRfGIKQwrrw7Bx9nViGmBQ-cuuFqLnwjzyUWbuhPoz2iBIJzzL9n9oz8R90N0QRpbGROAVnK3n43xA1vekb2Llay0RvmUkgonCpBO1BvqgNjJP6EWysqm3ulu0mEezGwQW2TkI9pWr2oSZ0PMiUHIAIJcEekCY3B12iI4fzwlc-SkT6PPP75YA9uZApHJ0d6m6zXGt0g",
    ],
    includes: [
      "Transporte ida y vuelta en lancha premium",
      "Cóctel de bienvenida",
      "Almuerzo caribeño de 3 tiempos",
      "Acceso a beach club privado",
      "Guía bilingüe",
    ],
    excludes: ["Impuesto portuario", "Propinas"],
    itinerary: [
      { id: "1", time: "08:30", title: "Salida", description: "Check-in en muelle.", featured: true },
      { id: "2", time: "11:00", title: "Snorkel", description: "Recorrido guiado en arrecife." },
    ],
    pricingSeasons: [
      { id: "high", season: "Temporada alta", adultPriceCents: 12000, childPriceCents: 8500 },
    ],
    isFeatured: true,
  },
  {
    slug: "cartagena-historica",
    name: "Tour Histórico Cartagena",
    category: "Historia",
    packageType: "tour",
    badge: "Historia",
    country: "Colombia",
    location: "Cartagena, Colombia",
    shortDescription: "Ciudad amurallada y Castillo San Felipe con guía experto.",
    description: "Recorrido cultural por plazas, murallas y fuertes históricos.",
    longDescription: ["Ruta pensada para viajeros que buscan arquitectura y relatos locales."],
    priceFromCents: 8500,
    currency: "USD",
    rating: 4.8,
    reviewsCount: 215,
    durationLabel: "4 horas",
    groupSizeLabel: "Máx. 20",
    languages: "ES / EN",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0m7DSDeVyg8TZbAa7baaiV_tuuyKerUpwAJUIXZeWVwTIesQVM5CHPgMsjVWF3UPO3_6ERwl1EnLA7A3ZPWHcSvRIhftm2YMvN3FHW_gGXmyvCDeKm8SZLylNvK80hig_PX4JUKVDMjq_VVCFqvATNdmz337QLULCRaULFD_ymkiPCOcUGfcj28cBsCHJoIq5oCuT_HQ0keb5Fk8VAScYt8l3d6JylZ9gsE5tr54MRFObGi_rVjmidxtQwcpBFqHwvfCjXjAqXg",
    gallery: [],
    includes: ["Guía certificado", "Entrada a San Felipe"],
    excludes: ["Almuerzo", "Transporte hotel"],
    itinerary: [],
    pricingSeasons: [],
    isFeatured: false,
  },
  {
    slug: "tayrona-aventura",
    name: "Tayrona Aventura",
    category: "Aventura",
    packageType: "experiencia",
    country: "Colombia",
    location: "Santa Marta, Colombia",
    shortDescription: "Senderismo y playas vírgenes en el Parque Tayrona.",
    description: "Experiencia de naturaleza con guía local y almuerzo.",
    longDescription: ["Ideal para amantes de la naturaleza y el senderismo costero."],
    priceFromCents: 9500,
    currency: "USD",
    rating: 4.7,
    reviewsCount: 89,
    durationLabel: "10 horas",
    groupSizeLabel: "Máx. 12",
    languages: "ES",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARJVPW75K46Fu_3CYIbJ99tiUpurWhDn6KZvFR6agNb6fuQRT5FG9ihjfbCsFjrvCt7jPRbiSF0Pbzu5cMkrcDOypiturjtsLndxn7FOeYOZnMAUSr5nv3LLcsmvX8OkB-DS7nF-QB403cYsoldt8vCVLUizPcgV2mvhnKHJiAsYiyD6MyPGbJMFbb7mimWiV2lsvxgOqbq8y_Iwd2vG95OmputFnC4lfhBxZi8lEyQkN76ZqtrB7TNrNnJzMQ0B35UlXQbSrm2w",
    gallery: [],
    includes: ["Guía", "Snack"],
    excludes: ["Entrada al parque"],
    itinerary: [],
    pricingSeasons: [],
    isFeatured: false,
  },
  {
    slug: "dia-playa-baru",
    name: "Día de playa en Barú",
    category: "Playa",
    packageType: "pasadia",
    country: "Colombia",
    location: "Barú, Colombia",
    shortDescription: "Playa de arena blanca y aguas turquesas en el sur del Caribe.",
    description: "Pasadía relajada con transporte, almuerzo y tiempo libre en playa.",
    longDescription: ["Perfecto para familias y grupos que buscan descanso frente al mar."],
    priceFromCents: 7500,
    currency: "USD",
    rating: 4.6,
    reviewsCount: 156,
    durationLabel: "9 horas",
    groupSizeLabel: "Máx. 18",
    languages: "ES",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYDxlffsxshbllKHjYGb200_xgE1FMyU_PYfXSIwR0u16nKQ-Gps0-vgkP2GzxJ-eCsfMclQDG_gXDxtEaSgtpEyBx8_sG0z_7udX5yfaCjlw-YdYoChhqZrF2dHCjF7wU9K9qLtMu4Y0Plx8-pjUXvLKM0ogTYduVIsc9A7Bg3OvAzID3qm8O1sbqDoOYFKGMXkUCBOsM7di_MlmXrUVjSN3QhLtFuP4xaZvSErHE1JLGV7TubsyfRzYEsceiEqNrQAXT8cBZUQ",
    gallery: [],
    includes: ["Transporte", "Almuerzo"],
    excludes: ["Bebidas extra"],
    itinerary: [],
    pricingSeasons: [],
    isFeatured: true,
  },
];

const client = new Client({ connectionString: databaseUrl });

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

try {
  await client.connect();

  for (const tour of tours) {
    const categorySlug = slugify(tour.category);
    const categoryResult = await client.query(
      `INSERT INTO tour_categories (slug, name) VALUES ($1, $2)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
      [categorySlug, tour.category],
    );
    const categoryId = categoryResult.rows[0].id;

    await client.query(
      `INSERT INTO tours (
        slug, name, category_id, package_type, badge, country, location,
        short_description, description, long_description, price_from_cents, currency,
        rating, reviews_count, duration_label, group_size_label, languages,
        hero_image_url, gallery, includes, excludes, itinerary, pricing_seasons,
        is_active, is_featured
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,TRUE,$24
      )
      ON CONFLICT (slug) DO NOTHING`,
      [
        tour.slug,
        tour.name,
        categoryId,
        tour.packageType,
        tour.badge ?? null,
        tour.country,
        tour.location,
        tour.shortDescription,
        tour.description,
        JSON.stringify(tour.longDescription),
        tour.priceFromCents,
        tour.currency,
        tour.rating,
        tour.reviewsCount,
        tour.durationLabel,
        tour.groupSizeLabel,
        tour.languages,
        tour.heroImage,
        JSON.stringify(tour.gallery.length ? tour.gallery : [tour.heroImage]),
        JSON.stringify(tour.includes),
        JSON.stringify(tour.excludes),
        JSON.stringify(tour.itinerary),
        JSON.stringify(tour.pricingSeasons),
        tour.isFeatured,
      ],
    );
  }

  console.log("Catálogo de tours sembrado.");
} catch (error) {
  console.error("Error al sembrar catálogo:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
