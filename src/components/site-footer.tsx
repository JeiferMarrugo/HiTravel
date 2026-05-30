import Link from "next/link";
import { defaultSiteContent } from "@/lib/site-content/defaults";
import { navigationLinks } from "@/lib/site-data";

export function SiteFooter() {
  const { contact, brand, footer } = defaultSiteContent;
  return (
    <footer className="border-t border-white/10 bg-primary text-on-primary">
      <div className="mx-auto grid max-w-shell gap-10 px-4 py-16 md:grid-cols-[1.3fr_1fr_1fr] md:px-16">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container font-bold text-on-secondary-container">
              HI
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-secondary-container">{brand.name}</p>
              <p className="text-sm text-white/70">{footer.toursDescription}</p>
            </div>
          </div>
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
          <p className="text-sm text-white/80">
            {contact.address}
            <br />
            {contact.addressLine2}
          </p>
          <a className="block text-sm text-white/80 transition hover:text-white" href={`tel:${contact.phone}`}>
            {contact.phone}
          </a>
          <a className="block text-sm text-white/80 transition hover:text-white" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
