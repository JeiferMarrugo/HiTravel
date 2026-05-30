import Image from "next/image";
import Link from "next/link";
import { CurrencySwitcher } from "@/components/currency-switcher";
import devLogo from "@/public/images/logo_dev.jpeg";
import type { DisplayCurrency } from "@/lib/pricing/visitor-currency";
import type { SiteContent } from "@/lib/site-content/types";
import { isUploadedSiteImage } from "@/lib/site-content/utils";

type ActiveNav = "tours" | "about" | "contact";

type SiteChromeProps = {
  content: SiteContent;
  active: ActiveNav;
  displayCurrency?: DisplayCurrency;
};

const navItems = [
  { key: "tours", label: "Tours", href: "/tours" },
  { key: "day-trips", label: "Pasadías", href: "/tours" },
  { key: "about", label: "Sobre nosotros", href: "/nosotros" },
  { key: "contact", label: "Contacto", href: "/contacto" },
] as const;

function DeveloperCreditFooter() {
  return (
    <div className="border-t border-neutral-200 bg-white px-4 py-4 md:px-16">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">Elaborado por</span>
        <a
          href="https://example.com"
          target="_blank"
          rel="noreferrer"
          aria-label="Ir al sitio del desarrollador"
          className="rounded-md border border-neutral-200 bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
        >
          <Image src={devLogo} alt="Logo desarrollador" width={30} height={30} className="h-7 w-7 rounded-sm object-cover" />
        </a>
      </div>
    </div>
  );
}

export function TopNav({ content, active, displayCurrency = "COP" }: SiteChromeProps) {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-surface/80 backdrop-blur-xl shadow-sm shadow-primary/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-16">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-[22px] font-semibold tracking-tight text-primary">{content.brand.name}</span>
        </Link>

        <CurrencySwitcher initialCurrency={displayCurrency} />

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = item.key === active;
            const className = isActive
              ? "border-b-2 border-secondary font-bold text-primary"
              : "text-on-surface-variant hover:text-primary";

            return (
              <Link key={item.key} href={item.href} className={`text-base transition-colors ${className}`}>
                {item.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/contacto"
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-on-primary transition-transform active:scale-95"
        >
          {content.brand.navCtaLabel}
        </Link>
      </nav>
    </header>
  );
}

export function WhatsappFab({ content }: { content: SiteContent }) {
  return (
    <a
      href={content.contact.whatsappUrl}
      className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-2xl transition-transform hover:scale-110"
      aria-label="WhatsApp"
    >
      <span className="material-symbols-outlined text-4xl">chat</span>
    </a>
  );
}

export function HomeFooter({ content }: { content: SiteContent }) {
  const { social, footer, brand } = content;
  return (
    <>
      <footer className="w-full border-t border-outline-variant/20 bg-primary px-4 py-20 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm space-y-6">
            <div className="flex items-center gap-2">
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 brightness-0 invert"
                  unoptimized={isUploadedSiteImage(brand.logoUrl)}
                />
              ) : null}
              <span className="text-3xl font-bold text-secondary-container">{brand.name}</span>
            </div>
            <p className="text-sm leading-7 text-white/80">{footer.homeDescription}</p>
            <div className="flex gap-4">
              <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-secondary-container" href={social.instagram}>
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </a>
              <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-secondary-container" href={social.youtube}>
                <span className="material-symbols-outlined text-white">smart_display</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="font-bold text-secondary-container">Compañía</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href={social.facebook} className="transition-colors hover:text-secondary-container">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href={social.instagram} className="transition-colors hover:text-secondary-container">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href={social.youtube} className="transition-colors hover:text-secondary-container">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-secondary-container">Legal</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <Link href="/contacto" className="transition-colors hover:text-secondary-container">
                    Contáctanos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      <DeveloperCreditFooter />
    </>
  );
}

export function ToursFooter({ content }: { content: SiteContent }) {
  const { social, footer, brand } = content;
  return (
    <>
      <footer className="w-full bg-primary px-4 py-20 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
          <div className="flex max-w-xs flex-col gap-6">
            <div className="text-3xl font-bold text-secondary-container">{brand.name}</div>
            <p className="text-sm leading-7 text-white/80">{footer.toursDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold text-secondary-container">Síguenos</span>
              <a className="text-sm text-white/80 hover:text-secondary-container" href={social.facebook}>
                Facebook
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href={social.instagram}>
                Instagram
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href={social.youtube}>
                YouTube
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold text-secondary-container">Soporte</span>
              <Link className="text-sm text-white/80 hover:text-secondary-container" href="/contacto">
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <DeveloperCreditFooter />
    </>
  );
}

export function ContactFooter({ content }: { content: SiteContent }) {
  const { social, footer, brand } = content;
  return (
    <>
      <footer className="w-full border-t border-outline-variant/20 bg-primary px-4 py-20 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
          <div className="space-y-4">
            <div className="text-3xl font-bold text-secondary-container">{brand.name}</div>
            <p className="max-w-xs text-sm leading-7 text-white/80">{footer.contactCopyright}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <span className="mb-2 text-sm font-semibold text-secondary-container">Conecta</span>
              <a className="text-sm text-white/80 hover:text-secondary-container" href={social.facebook}>
                Facebook
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href={social.instagram}>
                Instagram
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="mb-2 text-sm font-semibold text-secondary-container">Empresa</span>
              <Link className="text-sm text-white/80 hover:text-secondary-container" href="/nosotros">
                Sobre nosotros
              </Link>
              <Link className="text-sm text-white/80 hover:text-secondary-container" href="/contacto">
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <DeveloperCreditFooter />
    </>
  );
}

export function DetailFooter({ content }: { content: SiteContent }) {
  const { social, footer, brand } = content;
  return (
    <>
      <footer className="w-full border-t border-outline-variant/20 bg-primary px-4 py-20 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
          <div className="md:w-1/3">
            <h2 className="mb-6 text-3xl font-bold text-secondary-container">{brand.name}</h2>
            <p className="mb-8 text-sm leading-7 text-white/80">{footer.detailDescription}</p>
            <div className="flex gap-4">
              <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-secondary-container hover:text-on-secondary-container" href={social.facebook}>
                <span className="material-symbols-outlined">social_leaderboard</span>
              </a>
              <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-secondary-container hover:text-on-secondary-container" href={social.instagram}>
                <span className="material-symbols-outlined">photo_camera</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="mb-6 text-xl font-semibold text-white">Enlaces rápidos</h4>
              <ul className="space-y-4 text-sm text-white/80">
                <li>
                  <Link href="/tours" className="hover:text-secondary-container">
                    Tours
                  </Link>
                </li>
                <li>
                  <Link href="/nosotros" className="hover:text-secondary-container">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-secondary-container">
                    Contáctanos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:w-1/4">
            <p className="mb-4 text-sm leading-7 text-white/60">{footer.homeCopyright}</p>
            <div className="flex items-center gap-2 text-white/60">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="text-sm">{footer.locationLabel}</span>
            </div>
          </div>
        </div>
      </footer>
      <DeveloperCreditFooter />
    </>
  );
}
