"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { notify } from "@/lib/toast";

export function LoginExpiredNotice() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      notify.warning("Tu sesión expiró. Inicia sesión nuevamente.");
    }
    if (searchParams.get("error") === "invalid") {
      notify.error("Credenciales inválidas.");
    }
  }, [searchParams]);

  return null;
}
