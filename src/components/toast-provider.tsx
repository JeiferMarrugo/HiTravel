"use client";

import { Toaster } from "sonner";
import { TOAST_DURATION_MS } from "@/lib/toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={TOAST_DURATION_MS}
      toastOptions={{
        classNames: {
          toast: "coastal-shadow border border-outline-variant/20 font-sans",
          title: "text-sm font-semibold text-primary",
          description: "text-sm text-on-surface-variant",
          success: "bg-white text-on-surface",
          error: "bg-white text-on-surface",
          info: "bg-white text-on-surface",
          warning: "bg-white text-on-surface",
        },
      }}
    />
  );
}
