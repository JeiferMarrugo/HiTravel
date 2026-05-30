/** Montos en BD: COP = pesos enteros; USD = centavos (×100 al guardar). */

export function parseMoneyInput(value: number, currency: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("El monto debe ser mayor a cero.");
  }
  if (currency === "USD") {
    return Math.round(value * 100);
  }
  return Math.round(value);
}

export function formatMoneyDisplay(amountMinor: number | null, currency: string): string {
  if (amountMinor === null) {
    return "—";
  }
  const amount = currency === "USD" ? amountMinor / 100 : amountMinor;
  return new Intl.NumberFormat("es-CO", { style: "currency", currency }).format(amount);
}

/** Valor almacenado en BD (price_from_cents, amount_cents en COP) → monto para mostrar. */
export function amountFromStorage(amountMinor: number, currency: string): number {
  return currency === "USD" ? amountMinor / 100 : amountMinor;
}

/** Monto que ingresa el usuario en el formulario → valor para guardar en BD. */
export function amountToStorage(displayAmount: number, currency: string): number {
  return parseMoneyInput(displayAmount, currency);
}

export function moneyInputHint(currency: string): string {
  return currency === "USD"
    ? "Ingresa dólares (ej. 120 = USD 120.00)"
    : "Ingresa pesos colombianos (ej. 450000)";
}
