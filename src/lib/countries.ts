export const COUNTRY_STORAGE_KEY = "hitravel-admin-countries";

export const defaultCountries = ["Colombia", "Panamá", "México", "República Dominicana", "Costa Rica"];

export function normalizeCountryName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function readStoredCountries(): string[] {
  if (typeof window === "undefined") {
    return defaultCountries;
  }

  const raw = window.localStorage.getItem(COUNTRY_STORAGE_KEY);

  if (!raw) {
    return defaultCountries;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return defaultCountries;
    }

    const cleaned = parsed
      .filter((item): item is string => typeof item === "string")
      .map(normalizeCountryName)
      .filter(Boolean);

    return cleaned.length ? Array.from(new Set(cleaned)) : defaultCountries;
  } catch {
    return defaultCountries;
  }
}

export function writeStoredCountries(countries: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const cleaned = countries.map(normalizeCountryName).filter(Boolean);
  window.localStorage.setItem(COUNTRY_STORAGE_KEY, JSON.stringify(Array.from(new Set(cleaned))));
}
