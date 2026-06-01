import Link from "next/link";

const MENU_TOGGLE_ID = "admin-user-menu-toggle";

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

const menuLinks = [
  { href: "/admin/perfil", icon: "person", label: "Mi perfil" },
  { href: "/admin/configuracion", icon: "settings", label: "Configuración" },
  { href: "/admin", icon: "dashboard", label: "Ir al dashboard" },
] as const;

export function AdminUserMenu({ userEmail, userName, userRole }: AdminUserMenuProps) {
  return (
    <div className="relative">
      <input id={MENU_TOGGLE_ID} type="checkbox" className="peer/dropdown sr-only" tabIndex={-1} aria-hidden />

      <label
        htmlFor={MENU_TOGGLE_ID}
        className="flex cursor-pointer touch-manipulation select-none items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-white/70"
        aria-haspopup="menu"
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-primary">{userName}</p>
          <p className="text-xs capitalize text-on-surface-variant">{userRole}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-primary">
          {getInitials(userName)}
        </div>
        <span className="material-symbols-outlined hidden text-[20px] text-on-surface-variant sm:inline">expand_more</span>
      </label>

      <label
        htmlFor={MENU_TOGGLE_ID}
        className="fixed inset-0 z-20 hidden cursor-default bg-transparent peer-checked/dropdown:block"
        aria-hidden
      />

      <div
        role="menu"
        className="absolute right-0 top-[calc(100%+0.5rem)] z-30 hidden w-72 overflow-hidden rounded-[1.5rem] border border-outline-variant/15 bg-white coastal-shadow peer-checked/dropdown:block"
      >
        <div className="border-b border-outline-variant/15 bg-surface-container-low px-4 py-4">
          <p className="font-semibold text-primary">{userName}</p>
          <p className="mt-1 truncate text-sm text-on-surface-variant">{userEmail}</p>
          <p className="mt-2 inline-flex rounded-full bg-secondary-container/40 px-3 py-1 text-xs font-semibold capitalize text-primary">
            {userRole}
          </p>
        </div>

        <div className="p-2">
          {menuLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-on-surface transition hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-700 transition hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px] text-red-600">logout</span>
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
