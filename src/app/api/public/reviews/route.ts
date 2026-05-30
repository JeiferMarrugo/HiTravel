import { NextResponse } from "next/server";
import { submitTourReview } from "@/lib/catalog/tour-reviews";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const token = typeof body.token === "string" ? body.token : "";
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment : "";

    if (!token) {
      return NextResponse.json({ error: "Enlace no válido." }, { status: 400 });
    }

    const review = await submitTourReview({ token, rating, comment });

    return NextResponse.json({
      ok: true,
      review: {
        id: review.id,
        rating: review.rating,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible guardar la reseña.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
