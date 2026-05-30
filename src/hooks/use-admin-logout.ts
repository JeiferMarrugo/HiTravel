"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { notify } from "@/lib/toast";

export function useAdminLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        notify.error(payload.error ?? "No fue posible cerrar sesión.");
        return;
      }

      notify.success(payload.message ?? "Sesión cerrada correctamente.");
      router.push("/admin/login");
      router.refresh();
    } catch {
      notify.error("No fue posible cerrar sesión.");
    } finally {
      setIsLoggingOut(false);
    }
  }, [router]);

  return { logout, isLoggingOut };
}
