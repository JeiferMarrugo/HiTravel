export function isUploadedSiteImage(url: string) {
  return url.startsWith("/uploads");
}
