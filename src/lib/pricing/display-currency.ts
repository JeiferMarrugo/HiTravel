import { amountFromStorage, formatMoneyDisplay } from "@/lib/catalog/money";

export type DisplayCurrency = "COP" | "USD";

export const DISPLAY_CURRENCY_COOKIE = "ht_currency";

export type PricingSettings = {
  usdCopRate: number;
  copCountryCodes: string[];
};

export function detectCurrencyFromHeaders(
  headerList: Headers,
  settings: PricingSettings,
): DisplayCurrency {
  const country = (
    headerList.get("x-vercel-ip-country") ??
    headerList.get("cf-ipcountry") ??
    headerList.get("x-country-code") ??
    ""
  )
    .trim()
    .toUpperCase();

  if (country && settings.copCountryCodes.map((c) => c.toUpperCase()).includes(country)) {
    return "COP";
  }

  const acceptLanguage = (headerList.get("accept-language") ?? "").toLowerCase();
  if (acceptLanguage.includes("es-co") || acceptLanguage.includes("es-cop")) {
    return "COP";
  }

  const timezone = headerList.get("x-vercel-ip-timezone") ?? "";
  if (timezone.startsWith("America/") && /Bogota|Cartagena/i.test(timezone)) {
    return "COP";
  }

  return "USD";
}

export function convertForDisplay(
  amountMinor: number,
  storedCurrency: string,
  displayCurrency: DisplayCurrency,
  usdCopRate: number,
): { amountMinor: number; currency: DisplayCurrency } {
  if (storedCurrency === displayCurrency) {
    return { amountMinor, currency: displayCurrency };
  }

  const rate = usdCopRate > 0 ? usdCopRate : 4200;
  const amountDisplay = amountFromStorage(amountMinor, storedCurrency);

  if (storedCurrency === "COP" && displayCurrency === "USD") {
    const usd = amountDisplay / rate;
    return { amountMinor: Math.round(usd * 100), currency: "USD" };
  }

  if (storedCurrency === "USD" && displayCurrency === "COP") {
    return { amountMinor: Math.round(amountDisplay * rate), currency: "COP" };
  }

  return { amountMinor, currency: displayCurrency };
}

export function formatVisitorPrice(
  priceFromCents: number,
  storedCurrency: string,
  displayCurrency: DisplayCurrency,
  usdCopRate: number,
): string {
  const converted = convertForDisplay(priceFromCents, storedCurrency, displayCurrency, usdCopRate);
  return formatMoneyDisplay(converted.amountMinor, converted.currency);
}
