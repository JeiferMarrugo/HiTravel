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
  }, [searchParams]);

  return null;
}
