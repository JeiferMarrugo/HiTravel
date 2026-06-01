type AdminFetchInit = RequestInit & {
  timeoutMs?: number;
};

let nativeFetchImpl: typeof fetch | null = null;

export function bindAdminNativeFetch(impl: typeof fetch) {
  nativeFetchImpl = impl;
}

function resolveFetch(): typeof fetch {
  if (nativeFetchImpl) {
    return nativeFetchImpl;
  }

  return fetch.bind(globalThis);
}

export async function adminFetch(input: RequestInfo | URL, init: AdminFetchInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("ngrok-skip-browser-warning", "true");

  const controller = new AbortController();
  const timeoutMs = init.timeoutMs ?? 30000;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await resolveFetch()(input, {
      ...init,
      credentials: init.credentials ?? "include",
      headers,
      signal: init.signal ?? controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}
