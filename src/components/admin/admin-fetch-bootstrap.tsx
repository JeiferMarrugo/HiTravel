"use client";

import { useEffect } from "react";
import { adminFetch, bindAdminNativeFetch } from "@/lib/admin/admin-fetch";

export function AdminFetchBootstrap() {
  useEffect(() => {
    const nativeFetch = window.fetch.bind(window);
    bindAdminNativeFetch(nativeFetch);

    window.fetch = (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input instanceof Request
              ? input.url
              : "";

      if (url.startsWith("/api/")) {
        return adminFetch(input, init);
      }

      return nativeFetch(input, init);
    };

    return () => {
      window.fetch = nativeFetch;
      bindAdminNativeFetch(nativeFetch);
    };
  }, []);

  return null;
}
