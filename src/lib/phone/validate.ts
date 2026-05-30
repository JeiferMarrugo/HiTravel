import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export type ParsedPhone = {
  e164: string;
  national: string;
  countryCallingCode: string;
  country: CountryCode;
};

export function parseAndValidatePhone(
  input: string,
  defaultCountry: CountryCode = "CO",
): ParsedPhone {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Ingresa un número de teléfono.");
  }

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    throw new Error("El número de teléfono no es válido. Usa tu número real con indicativo de país.");
  }

  return {
    e164: parsed.format("E.164"),
    national: parsed.formatNational(),
    countryCallingCode: parsed.countryCallingCode,
    country: parsed.country ?? defaultCountry,
  };
}

export function formatPhoneDisplay(e164: string, fallback = ""): string {
  const parsed = parsePhoneNumberFromString(e164);
  if (parsed?.isValid()) {
    return parsed.formatInternational();
  }
  return fallback || e164;
}
