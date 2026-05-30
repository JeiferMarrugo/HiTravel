"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAdminLogout } from "@/hooks/use-admin-logout";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type AdminUserMenuProps = {
  userEmail: string;
  userName: string;
  userRole: string;
};

type MenuItem =
  | { type: "link"; href: string; icon: string; label: string }
  | { type: "action"; icon: string; label: string; onClick: () => void; danger?: boolean };

export function AdminUserMenu({ userEmail, userName, userRole }: AdminUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, isLoggingOut } = useAdminLogout();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const menuItems: MenuItem[] = [
    { type: "link", href: "/admin/perfil", icon: "person", label: "Mi perfil" },
    { type: "link", href: "/admin/configuracion", icon: "settings", label: "Configuración" },
    { type: "link", href: "/admin", icon: "dashboard", label: "Ir al dashboard" },
    {
      type: "action",
      icon: "logout",
      label: isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión",
      onClick: () => {
        setIsOpen(false);
        void logout();
      },
      danger: true,
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-white/70"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-primary">{userName}</p>
          <p className="text-xs capitalize text-on-surface-variant">{userRole}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-primary">
          {getInitials(userName)}
        </div>
        <span className="material-symbols-outlined hidden text-[20px] text-on-surface-variant sm:inline">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-72 overflow-hidden rounded-[1.5rem] border border-outline-variant/15 bg-white coastal-shadow"
        >
          <div className="border-b border-outline-variant/15 bg-surface-container-low px-4 py-4">
            <p className="font-semibold text-primary">{userName}</p>
            <p className="mt-1 truncate text-sm text-on-surface-variant">{userEmail}</p>
            <p className="mt-2 inline-flex rounded-full bg-secondary-container/40 px-3 py-1 text-xs font-semibold capitalize text-primary">
              {userRole}
            </p>
          </div>

          <div className="p-2">
            {menuItems.map((item) => {
              if (item.type === "link") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-on-surface transition hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={isLoggingOut}
                  onClick={item.onClick}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition hover:bg-surface-container-low disabled:opacity-60 ${
                    item.danger ? "text-red-700" : "text-on-surface"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${item.danger ? "text-red-600" : "text-on-surface-variant"}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
