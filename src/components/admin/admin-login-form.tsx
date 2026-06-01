"use client";

import { adminFetch } from "@/lib/admin/admin-fetch";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/toast";

function syncPasswordFieldType(toggle: HTMLInputElement, password: HTMLInputElement) {
  password.type = toggle.checked ? "text" : "password";
}

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordRef = useRef<HTMLInputElement>(null);
  const showPasswordRef = useRef<HTMLInputElement>(null);
  const [rememberSession, setRememberSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo =
    searchParams.get("redirect") && searchParams.get("redirect")!.startsWith("/admin")
      ? searchParams.get("redirect")!
      : "/admin";

  useEffect(() => {
    const toggleEl = showPasswordRef.current;
    const passwordEl = passwordRef.current;

    if (!toggleEl || !passwordEl) {
      return;
    }

    function handleToggle() {
      syncPasswordFieldType(toggleEl!, passwordEl!);
    }

    toggleEl.addEventListener("change", handleToggle);
    return () => toggleEl.removeEventListener("change", handleToggle);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    try {
      const response = await adminFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          remember: rememberSession,
          redirect: redirectTo,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        notify.error(payload.error ?? "No fue posible iniciar sesión.");
        return;
      }

      notify.success(payload.message ?? "Bienvenido al panel de administración.");
      router.push(redirectTo);
      router.refresh();
    } catch {
      event.currentTarget.requestSubmit();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action="/api/auth/login" method="POST" onSubmit={handleSubmit} className="space-y-6 text-left">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div>
        <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-on-surface-variant">
          Correo electrónico
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3">
          <span className="material-symbols-outlined text-on-surface-variant">mail</span>
          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="w-full bg-transparent outline-none"
            placeholder="admin@hitravel.com"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="admin-password" className="text-sm font-semibold text-on-surface-variant">
            Contraseña
          </label>
          <button type="button" className="text-sm text-primary">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3">
          <span className="material-symbols-outlined shrink-0 text-on-surface-variant">lock</span>
          <input
            ref={showPasswordRef}
            id="admin-show-password"
            type="checkbox"
            className="peer/show sr-only"
            tabIndex={-1}
            aria-hidden
          />
          <input
            ref={passwordRef}
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="min-w-0 flex-1 bg-transparent outline-none"
            placeholder="••••••••"
          />
          <label
            htmlFor="admin-show-password"
            className="shrink-0 cursor-pointer touch-manipulation text-on-surface-variant peer-checked/show:hidden"
            aria-label="Mostrar contraseña"
          >
            <span className="material-symbols-outlined pointer-events-none">visibility</span>
          </label>
          <label
            htmlFor="admin-show-password"
            className="hidden shrink-0 cursor-pointer touch-manipulation text-on-surface-variant peer-checked/show:block"
            aria-label="Ocultar contraseña"
          >
            <span className="material-symbols-outlined pointer-events-none">visibility_off</span>
          </label>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-on-surface-variant">
        <input
          type="checkbox"
          checked={rememberSession}
          onChange={(event) => setRememberSession(event.target.checked)}
          className="h-4 w-4 rounded border-outline-variant text-primary"
        />
        Recordar esta sesión
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container px-6 py-4 text-lg font-semibold text-primary shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Ingresando..." : "Ingresar al panel"}
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </form>
  );
}
