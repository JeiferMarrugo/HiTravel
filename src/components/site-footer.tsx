import Link from "next/link";
import { contactDetails, navigationLinks } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-primary text-on-primary">
      <div className="mx-auto grid max-w-shell gap-10 px-4 py-16 md:grid-cols-[1.3fr_1fr_1fr] md:px-16">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container font-bold text-on-secondary-container">
              HI
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-secondary-container">HI TRAVEL</p>
              <p className="text-sm text-white/70">Tu próxima aventura comienza aquí</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/80">
            Diseñamos tours y pasadías en el Caribe colombiano con una experiencia clara, confiable y visualmente cuidada.
          </p>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-secondary-container">Navegación</p>
          <div className="space-y-3">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block text-sm text-white/80 transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-container">Contacto</p>
          <p className="text-sm text-white/80">{contactDetails.address}</p>
          <a className="block text-sm text-white/80 transition hover:text-white" href={`tel:${contactDetails.phone}`}>
            {contactDetails.phone}
          </a>
          <a className="block text-sm text-white/80 transition hover:text-white" href={`mailto:${contactDetails.email}`}>
            {contactDetails.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
