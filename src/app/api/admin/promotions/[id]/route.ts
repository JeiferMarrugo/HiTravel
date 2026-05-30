import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { deletePromotion, getPromotionById, updatePromotion } from "@/lib/catalog/promotions";
import type { UpdatePromotionInput } from "@/lib/catalog/types";
import type { PromotionConfig, PromotionType } from "@/lib/catalog/promotion-types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  const { id } = await context.params;

  try {
    const promotion = await getPromotionById(id);
    if (!promotion) {
      return NextResponse.json({ error: "Promoción no encontrada." }, { status: 404 });
    }
    return NextResponse.json(promotion);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar promoción.";
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
    const body = (await request.json()) as Record<string, unknown>;
    const input: UpdatePromotionInput = {};

    if (typeof body.name === "string") input.name = body.name;
    if (typeof body.description === "string") input.description = body.description;
    if (body.promotionType) input.promotionType = body.promotionType as PromotionType;
    if (body.config && typeof body.config === "object") {
      input.config = body.config as PromotionConfig;
    }
    if (body.tourIds !== undefined) {
      input.tourIds = Array.isArray(body.tourIds)
        ? body.tourIds.filter((tid): tid is string => typeof tid === "string")
        : null;
    }
    if (body.validFrom !== undefined) {
      input.validFrom = typeof body.validFrom === "string" ? body.validFrom : null;
    }
    if (body.validUntil !== undefined) {
      input.validUntil = typeof body.validUntil === "string" ? body.validUntil : null;
    }
    if (typeof body.isActive === "boolean") input.isActive = body.isActive;
    if (body.sortOrder !== undefined) input.sortOrder = Number(body.sortOrder) || 0;

    const promotion = await updatePromotion(id, input);
    return NextResponse.json(promotion);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al actualizar promoción.";
    const status =
      message.includes("no encontrada") || message.includes("Indica") ? 400 : 500;
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
    await deletePromotion(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al eliminar promoción.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
