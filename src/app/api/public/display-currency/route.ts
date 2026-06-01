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

function isPublicHost(hostname: string): boolean {
  return (
    hostname !== "0.0.0.0" &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1" &&
    !hostname.endsWith(".local")
  );
}

function resolvePublicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const ref = new URL(referer);
      if (isPublicHost(ref.hostname)) {
        return ref.origin;
      }
    } catch {
      // ignore malformed referer
    }
  }

  const host = request.headers.get("host");
  if (host) {
    const hostname = host.split(":")[0] ?? host;
    if (isPublicHost(hostname)) {
      const proto = request.url.startsWith("https") ? "https" : forwardedProto;
      return `${proto}://${host}`;
    }
  }

  return new URL(request.url).origin;
}

function sanitizeRedirectPath(path: string): string {
  if (path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return "/";
}

function safeRedirectUrl(request: Request, referer: string | null, fallbackPath = "/"): URL {
  if (referer) {
    try {
      const ref = new URL(referer);
      if (isPublicHost(ref.hostname)) {
        return ref;
      }
    } catch {
      // ignore malformed referer
    }
  }

  const origin = resolvePublicOrigin(request);
  return new URL(sanitizeRedirectPath(fallbackPath), origin);
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const prefersJson = contentType.includes("application/json");
    let currency: string | undefined;
    let redirectField: string | undefined;

    if (prefersJson) {
      const body = (await request.json()) as { currency?: string };
      currency = body.currency;
    } else {
      const form = await request.formData();
      currency = form.get("currency")?.toString();
      redirectField = form.get("redirect")?.toString();
    }

    if (currency !== "COP" && currency !== "USD") {
      return NextResponse.json({ error: "Moneda no válida." }, { status: 400 });
    }

    const cookieOptions = {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax" as const,
    };

    if (prefersJson) {
      const response = NextResponse.json({ ok: true, currency });
      response.cookies.set(DISPLAY_CURRENCY_COOKIE, currency, cookieOptions);
      return response;
    }

    const fallbackPath =
      redirectField && redirectField.startsWith("/") && !redirectField.startsWith("//")
        ? redirectField
        : "/";
    const redirectUrl = safeRedirectUrl(request, request.headers.get("referer"), fallbackPath);
    const response = NextResponse.redirect(redirectUrl, 303);
    response.cookies.set(DISPLAY_CURRENCY_COOKIE, currency, cookieOptions);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
