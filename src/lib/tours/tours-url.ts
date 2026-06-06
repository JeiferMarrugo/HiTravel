export type ToursSearchParams = Record<string, string | undefined>;

export function buildToursUrl(page: number, searchParams: ToursSearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || !value?.trim()) {
      continue;
    }
    params.set(key, value.trim());
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/tours?${query}` : "/tours";
}

export function parseCategoryParam(value: string | undefined) {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeCategoryParam(categories: string[]) {
  return categories.length ? categories.join(",") : undefined;
}

export function parseMaxPriceParam(value: string | undefined) {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
