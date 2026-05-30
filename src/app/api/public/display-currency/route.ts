import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  detectCurrencyFromHeaders,
  DISPLAY_CURRENCY_COOKIE,
  type DisplayCurrency,
} from "@/lib/pricing/visitor-currency";
import { getUsdCopExchangeRate } from "@/lib/catalog/catalog-options";
import { getSiteContent } from "@/lib/site-content";

export async function GET() {
  try {
    const content = await getSiteContent();
    const headerList = await headers();
    const cookieHeader = headerList.get("cookie") ?? "";
    const match = cookieHeader.match(new RegExp(`${DISPLAY_CURRENCY_COOKIE}=([^;]+)`));
    const saved = match?.[1] as DisplayCurrency | undefined;

    const detected = detectCurrencyFromHeaders(headerList, content.pricing);
    const country =
      headerList.get("x-vercel-ip-country") ??
      headerList.get("cf-ipcountry") ??
      null;

    return NextResponse.json({
      currency: saved === "COP" || saved === "USD" ? saved : detected,
      detected,
      saved: saved === "COP" || saved === "USD" ? saved : null,
      country,
      usdCopRate: await getUsdCopExchangeRate(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { currency?: string };
    const currency = body.currency;

    if (currency !== "COP" && currency !== "USD") {
      return NextResponse.json({ error: "Moneda no válida." }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, currency });
    response.cookies.set(DISPLAY_CURRENCY_COOKIE, currency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
