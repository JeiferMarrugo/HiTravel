"use client";

import { useAdminLogout } from "@/hooks/use-admin-logout";

export function AdminLogoutButton() {
  const { logout, isLoggingOut } = useAdminLogout();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await logout();
    } catch {
      event.currentTarget.submit();
    }
  }

  return (
    <form action="/api/auth/logout" method="POST" onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isLoggingOut}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        {isLoggingOut ? "Cerrando..." : "Salir"}
      </button>
    </form>
  );
}
