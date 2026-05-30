import { NextResponse } from "next/server";
import { isSessionError, requireAdminSession } from "@/lib/auth/require-session";
import {
  createCountry,
  createCurrency,
  createTourCategory,
  deleteCountry,
  deleteCurrency,
  deleteTourCategory,
  getCatalogOptions,
  updateCurrencyExchangeRate,
} from "@/lib/catalog/catalog-options";

export async function GET() {
  const session = await requireAdminSession();
  if (isSessionError(session)) {
    return session;
  }

  try {
    return NextResponse.json(await getCatalogOptions());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar opciones.";
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
    const kind = body.kind;

    if (kind === "currency") {
      const code = typeof body.code === "string" ? body.code : "";
      const name = typeof body.name === "string" ? body.name : "";
      const copExchangeRate =
        body.copExchangeRate !== undefined && body.copExchangeRate !== ""
          ? Number(body.copExchangeRate)
          : undefined;
      await createCurrency(code, name, copExchangeRate);
      return NextResponse.json(await getCatalogOptions());
    }

    if (kind === "currency-rate") {
      const code = typeof body.code === "string" ? body.code : "USD";
      const copExchangeRate = Number(body.copExchangeRate);
      await updateCurrencyExchangeRate(code, copExchangeRate);
      return NextResponse.json(await getCatalogOptions());
    }

    if (kind === "country") {
      const name = typeof body.name === "string" ? body.name : "";
      await createCountry(name);
      return NextResponse.json(await getCatalogOptions());
    }

    if (kind === "category") {
      const name = typeof body.name === "string" ? body.name : "";
      await createTourCategory(name);
      return NextResponse.json(await getCatalogOptions());
    }

    if (kind === "delete") {
      const target = body.target;
      const id = typeof body.id === "string" ? body.id : "";

      if (target === "currency" && id) {
        await deleteCurrency(id);
      } else if (target === "country" && id) {
        await deleteCountry(id);
      } else if (target === "category" && id) {
        await deleteTourCategory(id);
      } else {
        throw new Error("Solicitud de eliminación no válida.");
      }

      return NextResponse.json(await getCatalogOptions());
    }

    throw new Error("Tipo de operación no válido.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar.";
    const status =
      message.includes("obligatorio") ||
      message.includes("válid") ||
      message.includes("eliminar") ||
      message.includes("configurad")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
