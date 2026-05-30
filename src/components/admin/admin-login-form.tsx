"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/toast";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember: rememberSession }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        notify.error(payload.error ?? "No fue posible iniciar sesión.");
        return;
      }

      notify.success(payload.message ?? "Bienvenido al panel de administración.");

      const redirectTo = searchParams.get("redirect");
      router.push(redirectTo && redirectTo.startsWith("/admin") ? redirectTo : "/admin");
      router.refresh();
    } catch {
      notify.error("No fue posible conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-on-surface-variant">
          Correo electrónico
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3">
          <span className="material-symbols-outlined text-on-surface-variant">mail</span>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          <span className="material-symbols-outlined text-on-surface-variant">lock</span>
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="text-on-surface-variant"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
          </button>
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
