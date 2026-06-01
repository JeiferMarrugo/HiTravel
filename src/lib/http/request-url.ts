function isPublicHost(hostname: string): boolean {
  return (
    hostname !== "0.0.0.0" &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1" &&
    !hostname.endsWith(".local")
  );
}

export function resolvePublicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const ref = new URL(referer);
      if (isPublicHost(ref.hostname)) {
        return ref.origin;
      }
    } catch {
      // ignore malformed referer
    }
  }

  const host = request.headers.get("host");
  if (host) {
    const hostname = host.split(":")[0] ?? host;
    if (isPublicHost(hostname)) {
      const proto = request.url.startsWith("https") ? "https" : forwardedProto;
      return `${proto}://${host}`;
    }
  }

  return new URL(request.url).origin;
}

export function sanitizeRedirectPath(path: string): string {
  if (path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return "/";
}

export function safeRedirectUrl(request: Request, path: string): URL {
  return new URL(sanitizeRedirectPath(path), resolvePublicOrigin(request));
}

export function isHttpsRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return forwardedProto === "https" || request.url.startsWith("https://");
}
