export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = slugify(base) || "experiencia";
  let suffix = 0;

  while (await exists(suffix === 0 ? slug : `${slug}-${suffix}`)) {
    suffix += 1;
  }

  return suffix === 0 ? slug : `${slug}-${suffix}`;
}
