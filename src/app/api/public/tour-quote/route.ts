import { NextResponse } from "next/server";
import { quotePublicTour } from "@/lib/catalog/public-tour-quote";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const slug = typeof body.slug === "string" ? body.slug : "";
    if (!slug) {
      return NextResponse.json({ error: "Tour no indicado." }, { status: 400 });
    }

    const adults = body.adults !== undefined ? Number(body.adults) : undefined;
    const children = body.children !== undefined ? Number(body.children) : undefined;
    const checkinAt = typeof body.checkinAt === "string" ? body.checkinAt : undefined;

    const quote = await quotePublicTour({ slug, adults, children, checkinAt });
    if (!quote) {
      return NextResponse.json({ error: "Tour no encontrado." }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible calcular el precio.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
