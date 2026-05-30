import { cookies, headers } from "next/headers";
import { getUsdCopExchangeRate } from "@/lib/catalog/catalog-options";
import {
  detectCurrencyFromHeaders,
  DISPLAY_CURRENCY_COOKIE,
  type DisplayCurrency,
  type PricingSettings,
} from "@/lib/pricing/display-currency";
import { getSiteContent } from "@/lib/site-content";

export type { DisplayCurrency, PricingSettings };
export {
  DISPLAY_CURRENCY_COOKIE,
  convertForDisplay,
  detectCurrencyFromHeaders,
  formatVisitorPrice,
} from "@/lib/pricing/display-currency";

export async function resolveDisplayCurrency(settings: PricingSettings): Promise<DisplayCurrency> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(DISPLAY_CURRENCY_COOKIE)?.value;
  if (saved === "COP" || saved === "USD") {
    return saved;
  }

  const headerList = await headers();
  return detectCurrencyFromHeaders(headerList, settings);
}

export async function getVisitorPricingContext() {
  const content = await getSiteContent();
  const displayCurrency = await resolveDisplayCurrency(content.pricing);
  const usdCopRate = await getUsdCopExchangeRate();
  return {
    content,
    displayCurrency,
    usdCopRate,
  };
}
