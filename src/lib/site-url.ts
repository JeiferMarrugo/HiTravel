/** URL pública del sitio (enlaces en WhatsApp, reseñas, etc.). */
export function getPublicSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
