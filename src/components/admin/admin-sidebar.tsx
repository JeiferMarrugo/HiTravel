"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { adminNavItems, isAdminNavActive } from "@/lib/admin/nav-items";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[236px] shrink-0 flex-col bg-primary px-4 py-6 text-white shadow-2xl lg:flex">
      <div className="px-2">
        <Link href="/admin" className="mb-1 block">
          <p className="text-[18px] font-extrabold tracking-tight text-secondary-container">HI TRAVEL</p>
          <p className="mt-1 text-xs text-white/70">Admin Console</p>
        </Link>
      </div>

      <nav className="mt-10 space-y-2">
        {adminNavItems.map((item) => {
          const active = isAdminNavActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active ? "bg-secondary-container text-primary shadow-lg" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/admin/reservas"
          className="mb-8 flex items-center justify-center gap-2 rounded-2xl bg-secondary-container px-4 py-4 text-sm font-semibold text-primary shadow-lg"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva reserva
        </Link>

        <div className="space-y-2 border-t border-white/10 pt-6">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white">
            <span className="material-symbols-outlined text-[18px]">help</span>
            Soporte
          </button>
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}
