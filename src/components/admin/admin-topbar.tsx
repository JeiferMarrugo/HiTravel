type AdminTopbarProps = {
  placeholder?: string;
  userName?: string;
  userRole?: string;
};

export function AdminTopbar({
  placeholder = "Buscar reservas, clientes o tours...",
  userName = "Alex Rivera",
  userRole = "Administrador",
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-outline-variant/20 bg-background/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 coastal-shadow">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder={placeholder}
              className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-full bg-white p-2.5 text-on-surface coastal-shadow">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
          </button>
          <button className="rounded-full bg-white p-2.5 text-on-surface coastal-shadow">
            <span className="material-symbols-outlined text-[18px]">help</span>
          </button>
          <div className="hidden items-center gap-3 border-l border-outline-variant/30 pl-4 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-primary">{userName}</p>
              <p className="text-xs text-on-surface-variant">{userRole}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-primary">
              AR
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
