"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SESSION_TIMEOUT_MS } from "@/lib/auth/constants";
import { notify } from "@/lib/toast";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;
const REFRESH_THROTTLE_MS = 60_000;
const IDLE_CHECK_MS = 30_000;

export function useAdminSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const lastActivityRef = useRef(0);
  const hiddenAtRef = useRef<number | null>(null);
  const refreshInFlightRef = useRef(false);
  const lastRefreshRef = useRef(0);

  const logout = useCallback(
    async (message = "Tu sesión expiró por inactividad.") => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // Ignorar errores de red al cerrar sesión.
      }

      notify.warning(message);
      router.replace("/admin/login?expired=1");
      router.refresh();
    },
    [router],
  );

  const touchSession = useCallback(async () => {
    const now = Date.now();
    if (refreshInFlightRef.current || now - lastRefreshRef.current < REFRESH_THROTTLE_MS) {
      return;
    }

    refreshInFlightRef.current = true;
    lastRefreshRef.current = now;

    try {
      const response = await fetch("/api/auth/session", { method: "POST" });
      if (!response.ok) {
        await logout();
        return;
      }

      lastActivityRef.current = Date.now();
    } catch {
      // Sin conexión temporal: no cerrar sesión de inmediato.
    } finally {
      refreshInFlightRef.current = false;
    }
  }, [logout]);

  const registerActivity = useCallback(() => {
    if (document.hidden) {
      return;
    }

    lastActivityRef.current = Date.now();
    void touchSession();
  }, [touchSession]);

  useEffect(() => {
    if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
      return;
    }

    const onActivity = () => registerActivity();

    const onVisibilityChange = () => {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
        return;
      }

      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;

      if (hiddenAt && Date.now() - lastActivityRef.current > SESSION_TIMEOUT_MS) {
        void logout("Tu sesión expiró mientras estabas fuera de la página.");
        return;
      }

      void touchSession();
    };

    const idleTimer = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      if (Date.now() - lastActivityRef.current > SESSION_TIMEOUT_MS) {
        void logout();
      }
    }, IDLE_CHECK_MS);

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, onActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    lastActivityRef.current = Date.now();
    void touchSession();

    return () => {
      window.clearInterval(idleTimer);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, onActivity);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [logout, pathname, registerActivity, touchSession]);
}
