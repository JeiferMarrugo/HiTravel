import Image from "next/image";
import Link from "next/link";
import devLogo from "@/public/images/logo_dev.jpeg";
import { contactDetails } from "@/lib/site-data";

const logoUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBO5oDoomgBvwXYC2De_83fFELiB5C_XRgqL_mDl_2YzZTr9CfCZAtUbdpLZbprSLYJGPG8c_vqcF4DUZNPuKQPhOmK7MjAZUM7S_Skr9UUFJ27HylfEI3764dQ-AMf5VGewZ_iSQYG6kivmdRdrjlWzotqGVNjNxgN9TIOMFX3sJ-kkATVc0P_Tn66hd4bpdjKm8cytKfNI4SDGlvNyyMCyQ2gtA0QzElXVkvIcK1Qt6VXR61vKWtbIHZxMQo9Z3mqu6FLTkhVHg";

type ActiveNav = "tours" | "about" | "contact";

type TopNavProps = {
  active: ActiveNav;
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

export function TopNav({ active }: TopNavProps) {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-surface/80 backdrop-blur-xl shadow-sm shadow-primary/5">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-16">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-[22px] font-semibold tracking-tight text-primary">HI TRAVEL</span>
        </Link>

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
          Reserva ahora
        </Link>
      </nav>
    </header>
  );
}

export function WhatsappFab() {
  return (
    <a
      href={contactDetails.whatsapp}
      className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-2xl transition-transform hover:scale-110"
      aria-label="WhatsApp"
    >
      <span className="material-symbols-outlined text-4xl">chat</span>
    </a>
  );
}

export function HomeFooter() {
  return (
    <>
      <footer className="w-full border-t border-outline-variant/20 bg-primary px-4 py-20 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm space-y-6">
            <div className="flex items-center gap-2">
              <Image src={logoUrl} alt="HI TRAVEL Footer" width={40} height={40} className="h-10 w-10 brightness-0 invert" />
              <span className="text-3xl font-bold text-secondary-container">HI TRAVEL</span>
            </div>
            <p className="text-sm leading-7 text-white/80">
              © 2024 HI TRAVEL. Todos los derechos reservados. La aventura te espera. Tu agencia de confianza para descubrir los
              rincones más bellos del Caribe.
            </p>
            <div className="flex gap-4">
              <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-secondary-container" href="#">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </a>
              <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-secondary-container" href="#">
                <span className="material-symbols-outlined text-white">smart_display</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="font-bold text-secondary-container">Compañía</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href="#" className="transition-colors hover:text-secondary-container">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-secondary-container">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-secondary-container">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-secondary-container">Legal</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>
                  <a href="#" className="transition-colors hover:text-secondary-container">
                    Política de privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-secondary-container">
                    Términos del servicio
                  </a>
                </li>
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

export function ToursFooter() {
  return (
    <>
      <footer className="w-full bg-primary px-4 py-20 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
          <div className="flex max-w-xs flex-col gap-6">
            <div className="text-3xl font-bold text-secondary-container">HI TRAVEL</div>
            <p className="text-sm leading-7 text-white/80">
              Curadores de viajes enfocados en ofrecer experiencias seguras e inolvidables en el Caribe.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold text-secondary-container">Síguenos</span>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                Facebook
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                Instagram
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                YouTube
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold text-secondary-container">Soporte</span>
              <Link className="text-sm text-white/80 hover:text-secondary-container" href="/contacto">
                Contáctanos
              </Link>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                Política de privacidad
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                Términos del servicio
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold text-secondary-container">Boletín</span>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Correo"
                  className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40"
                />
                <button type="button" className="rounded-lg bg-secondary-container p-2 text-on-secondary-container">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <DeveloperCreditFooter />
    </>
  );
}

export function ContactFooter() {
  return (
    <>
      <footer className="w-full border-t border-outline-variant/20 bg-primary px-4 py-20 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
          <div className="space-y-4">
            <div className="text-3xl font-bold text-secondary-container">HI TRAVEL</div>
            <p className="max-w-xs text-sm leading-7 text-white/80">© 2024 HI TRAVEL. Todos los derechos reservados. La aventura te espera.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <span className="mb-2 text-sm font-semibold text-secondary-container">Conecta</span>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                Facebook
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                Instagram
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                YouTube
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
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                Política de privacidad
              </a>
              <a className="text-sm text-white/80 hover:text-secondary-container" href="#">
                Términos del servicio
              </a>
            </div>
          </div>
        </div>
      </footer>
      <DeveloperCreditFooter />
    </>
  );
}

export function DetailFooter() {
  return (
    <>
      <footer className="w-full border-t border-outline-variant/20 bg-primary px-4 py-20 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">
          <div className="md:w-1/3">
            <h2 className="mb-6 text-3xl font-bold text-secondary-container">HI TRAVEL</h2>
            <p className="mb-8 text-sm leading-7 text-white/80">
              Tu puerta de entrada a los destinos más exclusivos del Caribe. Curamos recuerdos, una ola a la vez.
            </p>
            <div className="flex gap-4">
              <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-secondary-container hover:text-on-secondary-container" href="#">
                <span className="material-symbols-outlined">social_leaderboard</span>
              </a>
              <a className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-secondary-container hover:text-on-secondary-container" href="#">
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
                  <Link href="/tours" className="hover:text-secondary-container">
                    Pasadías
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
            <div>
              <h4 className="mb-6 text-xl font-semibold text-white">Legal</h4>
              <ul className="space-y-4 text-sm text-white/80">
                <li>
                  <a href="#" className="hover:text-secondary-container">
                    Política de privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-container">
                    Términos del servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-secondary-container">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:w-1/4">
            <p className="mb-4 text-sm leading-7 text-white/60">© 2024 HI TRAVEL. Todos los derechos reservados. La aventura te espera.</p>
            <div className="flex items-center gap-2 text-white/60">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="text-sm">Cartagena, Colombia</span>
            </div>
          </div>
        </div>
      </footer>
      <DeveloperCreditFooter />
    </>
  );
}
