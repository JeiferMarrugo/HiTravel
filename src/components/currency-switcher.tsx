"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { DisplayCurrency } from "@/lib/pricing/visitor-currency";

type CurrencySwitcherProps = {
  initialCurrency: DisplayCurrency;
};

export function CurrencySwitcher({ initialCurrency }: CurrencySwitcherProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState<DisplayCurrency>(initialCurrency);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrency(initialCurrency);
  }, [initialCurrency]);

  async function select(next: DisplayCurrency) {
    if (next === currency || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await fetch("/api/public/display-currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: next }),
      });
      setCurrency(next);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="flex rounded-full border border-outline-variant/30 bg-white p-0.5 text-xs font-semibold shadow-sm"
      role="group"
      aria-label="Moneda de precios"
    >
      {(["COP", "USD"] as const).map((code) => (
        <button
          key={code}
          type="button"
          disabled={isSaving}
          onClick={() => void select(code)}
          className={`rounded-full px-3 py-1.5 transition ${
            currency === code
              ? "bg-primary text-white"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
