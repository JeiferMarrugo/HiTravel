const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Convierte "" o valores inválidos en null para columnas UUID opcionales. */
export function toNullableUuid(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || !isValidUuid(trimmed)) {
    return null;
  }
  return trimmed;
}

/** UUID obligatorio; lanza si falta o no es válido. */
export function requireUuid(value: string | null | undefined, label: string): string {
  const parsed = toNullableUuid(value);
  if (!parsed) {
    throw new Error(`${label} no es válido.`);
  }
  return parsed;
}
