import Link from "next/link";
import { navigationLinks } from "@/lib/site-data";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/5 bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-shell items-center justify-between px-4 py-4 md:px-16">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
            HI
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-primary">HI TRAVEL</p>
            <p className="text-xs text-on-surface-variant">Caribe curado a tu medida</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-on-surface-variant transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contacto"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
        >
          Reservar
        </Link>
      </div>
    </header>
  );
}
