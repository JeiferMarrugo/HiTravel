import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { assertCountryAllowed, assertCurrencyAllowed } from "@/lib/catalog/catalog-options";
import { amountToStorage } from "@/lib/catalog/money";
import { createTour, listTourCategories, listTours } from "@/lib/catalog/tours";
import type { CreateTourInput, PackageType } from "@/lib/catalog/types";

function parseTourBody(body: Record<string, unknown>): CreateTourInput {
  const packageType = body.packageType as PackageType;
  const validTypes = new Set(["pasadia", "paquete", "tour", "experiencia"]);

  if (!validTypes.has(packageType)) {
    throw new Error("Tipo de paquete no válido.");
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    throw new Error("El nombre es obligatorio.");
  }

  return {
    name: body.name,
    slug: typeof body.slug === "string" ? body.slug : undefined,
    categoryId: typeof body.categoryId === "string" ? body.categoryId : null,
    packageType,
    badge: typeof body.badge === "string" ? body.badge : null,
    country: typeof body.country === "string" ? body.country : "Colombia",
    location: typeof body.location === "string" ? body.location : "",
    shortDescription: typeof body.shortDescription === "string" ? body.shortDescription : "",
    description: typeof body.description === "string" ? body.description : "",
    longDescription: Array.isArray(body.longDescription)
      ? body.longDescription.filter((p): p is string => typeof p === "string")
      : [],
    currency: typeof body.currency === "string" ? body.currency : "USD",
    priceFromCents: amountToStorage(
      Number(body.priceFromCents) || 0,
      typeof body.currency === "string" ? body.currency : "USD",
    ),
    rating: Number(body.rating) || 4.8,
    reviewsCount: Number(body.reviewsCount) || 0,
    durationLabel: typeof body.durationLabel === "string" ? body.durationLabel : "",
    groupSizeLabel: typeof body.groupSizeLabel === "string" ? body.groupSizeLabel : "",
    languages: typeof body.languages === "string" ? body.languages : "ES",
    heroImageUrl: typeof body.heroImageUrl === "string" ? body.heroImageUrl : null,
    gallery: Array.isArray(body.gallery) ? body.gallery.filter((u): u is string => typeof u === "string") : [],
    includes: Array.isArray(body.includes) ? body.includes.filter((u): u is string => typeof u === "string") : [],
    excludes: Array.isArray(body.excludes) ? body.excludes.filter((u): u is string => typeof u === "string") : [],
    highlights: Array.isArray(body.highlights)
      ? body.highlights.filter((u): u is string => typeof u === "string")
      : [],
    meetingPoint: typeof body.meetingPoint === "string" ? body.meetingPoint : null,
    cancellationPolicy: typeof body.cancellationPolicy === "string" ? body.cancellationPolicy : null,
    pricingSeasons: Array.isArray(body.pricingSeasons) ? body.pricingSeasons : [],
    itinerary: Array.isArray(body.itinerary) ? body.itinerary : [],
    isActive: body.isActive !== false,
    isFeatured: Boolean(body.isFeatured),
    sortOrder: Number(body.sortOrder) || 0,
  };
}

export async function GET() {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const [tours, categories] = await Promise.all([listTours(), listTourCategories()]);
    return NextResponse.json({ tours, categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al listar tours.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseTourBody(body);
    await assertCurrencyAllowed(input.currency);
    await assertCountryAllowed(input.country);
    const tour = await createTour(input);
    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear tour.";
    const status = message.includes("obligatorio") || message.includes("válido") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
