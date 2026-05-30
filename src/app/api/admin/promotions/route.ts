import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import { createPromotion, listPromotions } from "@/lib/catalog/promotions";
import type { CreatePromotionInput } from "@/lib/catalog/types";
import type { PromotionConfig, PromotionType } from "@/lib/catalog/promotion-types";
import { DEFAULT_PROMOTION_CONFIG } from "@/lib/catalog/promotion-types";

function parsePromotionBody(body: Record<string, unknown>): CreatePromotionInput {
  if (typeof body.name !== "string" || !body.name.trim()) {
    throw new Error("El nombre de la promoción es obligatorio.");
  }

  const promotionType = body.promotionType as PromotionType;
  const config = (body.config && typeof body.config === "object"
    ? body.config
    : DEFAULT_PROMOTION_CONFIG[promotionType]) as PromotionConfig;

  return {
    name: body.name,
    slug: typeof body.slug === "string" ? body.slug : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    promotionType,
    config,
    tourIds: Array.isArray(body.tourIds)
      ? body.tourIds.filter((id): id is string => typeof id === "string")
      : null,
    validFrom: typeof body.validFrom === "string" ? body.validFrom : null,
    validUntil: typeof body.validUntil === "string" ? body.validUntil : null,
    isActive: body.isActive !== false,
    sortOrder: Number(body.sortOrder) || 0,
  };
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const activeOnly = new URL(request.url).searchParams.get("active") === "1";
    const promotions = await listPromotions({ activeOnly });
    return NextResponse.json({ promotions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al listar promociones.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    const body = parsePromotionBody((await request.json()) as Record<string, unknown>);
    const promotion = await createPromotion(body);
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear promoción.";
    const status =
      message.includes("obligatorio") || message.includes("Indica") || message.includes("válido")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
