import { NextResponse } from "next/server";
import { readAdminFormBody } from "@/lib/admin/read-admin-form-body";
import { respondAdminFormSave } from "@/lib/admin/respond-admin-form-save";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { assertCountryAllowed, assertCurrencyAllowed } from "@/lib/catalog/catalog-options";
import { amountToStorage } from "@/lib/catalog/money";
import { deleteTour, getTourById, updateTour } from "@/lib/catalog/tours";
import type { UpdateTourInput } from "@/lib/catalog/types";

type RouteContext = { params: Promise<{ id: string }> };

async function updateTourFromRequest(request: Request, id: string) {
  const { body, prefersJson } = await readAdminFormBody<Record<string, unknown>>(request);

  if (typeof body.currency === "string") {
    await assertCurrencyAllowed(body.currency);
  }
  if (typeof body.country === "string") {
    await assertCountryAllowed(body.country);
  }

  if (body.priceFromCents !== undefined) {
    const current = await getTourById(id);
    const currency = typeof body.currency === "string" ? body.currency : (current?.currency ?? "COP");
    body.priceFromCents = amountToStorage(Number(body.priceFromCents) || 0, currency);
  }

  const tour = await updateTour(id, body as UpdateTourInput);
  return respondAdminFormSave(request, `/admin/tours/${tour.id}?saved=1`, tour, prefersJson);
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const tour = await getTourById(id);
    if (!tour) {
      return NextResponse.json({ error: "Tour no encontrado." }, { status: 404 });
    }
    return NextResponse.json(tour);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar tour.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    return await updateTourFromRequest(request, id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar tour.";
    const status = message.includes("encontrado") || message.includes("slug") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    return await updateTourFromRequest(request, id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar tour.";
    const status = message.includes("encontrado") || message.includes("slug") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    await deleteTour(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar tour.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
