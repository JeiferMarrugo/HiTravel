"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DisplayCurrency } from "@/lib/pricing/visitor-currency";

type CurrencySwitcherProps = {
  initialCurrency: DisplayCurrency;
};

export function CurrencySwitcher({ initialCurrency }: CurrencySwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currency, setCurrency] = useState<DisplayCurrency>(initialCurrency);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrency(initialCurrency);
  }, [initialCurrency]);

  async function select(event: React.MouseEvent<HTMLButtonElement>, next: DisplayCurrency) {
    if (next === currency || isSaving) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/public/display-currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: next }),
      });

      if (!response.ok) {
        event.currentTarget.form?.requestSubmit(event.currentTarget);
        return;
      }

      setCurrency(next);
      router.refresh();
    } catch {
      event.currentTarget.form?.requestSubmit(event.currentTarget);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      action="/api/public/display-currency"
      method="POST"
      className="relative z-[2] flex shrink-0 items-center gap-0.5 rounded-full border border-neutral-200/80 bg-neutral-50 p-0.5 text-[11px] font-medium"
      role="group"
      aria-label="Moneda de precios"
    >
      <input type="hidden" name="redirect" value={pathname} />
      {(["COP", "USD"] as const).map((code) => (
        <button
          key={code}
          type="submit"
          name="currency"
          value={code}
          disabled={isSaving || currency === code}
          aria-pressed={currency === code}
          onClick={(event) => void select(event, code)}
          className={`min-h-[40px] min-w-[2.5rem] touch-manipulation rounded-full px-2.5 py-1.5 transition-colors active:scale-[0.97] lg:min-h-0 lg:min-w-[2.5rem] lg:px-2.5 lg:py-1.5 lg:text-xs ${
            currency === code
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          {code}
        </button>
      ))}
    </form>
  );
}
