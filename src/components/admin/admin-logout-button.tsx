"use client";

import { useAdminLogout } from "@/hooks/use-admin-logout";

export function AdminLogoutButton() {
  const { logout, isLoggingOut } = useAdminLogout();

  return (
    <button
      type="button"
      onClick={() => void logout()}
      disabled={isLoggingOut}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      {isLoggingOut ? "Cerrando..." : "Salir"}
    </button>
  );
}
