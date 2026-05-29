import Image from "next/image";
import Link from "next/link";
import { CountrySearch } from "@/components/country-search";
import { HomeFooter, TopNav, WhatsappFab } from "@/components/site-chrome";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ6B72dtx69VaC6nS2TffgBNQw63_RNdYJIsfym5-Rjj1p42-xkwMzWd5WlSygtQxdmMeEbu9mHk68YLgfX1K6qOUG0UeYsxbWbVFVVZddSV7mns1hFyGtG-XxZ8yF_dMQaYCoj-s4GyTAsVEc4K3Tvn1_5RQzFXTjUVow4SLA0VlMCDAIApBF1IqVz3pCewwpUvqzywko1fjlnTV6_xOaoF-V3Iwwtc3qqB8uU0xNkK6kXkNODfI2PUIu7rtDJ8X2KO0Qs9XPiQ";

const featuredTours = [
  {
    title: "Isla del Rosario de Lujo",
    description: "Explora un archipiélago paradisíaco con almuerzo gourmet y snorkel incluido.",
    price: "$149k",
    duration: "8h",
    rating: "4.9",
    tag: "Destacado",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBpxYdzRanvgvQJdgAqKqLAc1d0QM964KNbNm1PhZif3-sr1jUkgrVYKU3OD5l_arpotmagdCLc5I8GTutri4rpu7OpsgLPAxiynIKL9FKZxGrNDagDo8bySrmJdpU1y_k7W5xr71lD_j2ellxDVFpMJA0ZtzMeuxhHQVnF6CiHxWCVBL2iT-CTkuWNMhd8WzPOJNG8DOAOAZQvBeOfuVWTewFSnJnHzyRdK7eWIJiVX2TjjROQshJEz4B5f3DMki7zi2-XC9ZMLw",
  },
  {
    title: "Caminata Centro Histórico",
    description: "Un recorrido por las murallas y la historia colonial que guardan cada callejón.",
    price: "$85k",
    duration: "4h",
    rating: "4.8",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCV4EYPWa6o15sUi7K3J0c1jUWqK6gE8O4fLFbQXxcZKxtDZUT7hRc6WROq_HsEcX0o1XUGA3-N3JPmLYpnc95g4grbWoUuMqmCH9LDVd7xcqsnSHmPutXEAWIMZYEg8a6JUI766CCkMJSfMj6T06wj5Yzo_WlfQR4ctypDNZKd-piliT_KFDdT1pENw2v3JvqHoveeiDdH2gX9H4uhawG-35xfDvnH62x2HB5MD-CMyEvT8ehxvg34jpfoIiMUKGjg8fVyNLXSzg",
  },
  {
    title: "Laguna Encantada",
    description: "Vive el fenómeno natural de la bioluminiscencia en una noche mágica.",
    price: "$120k",
    duration: "3h",
    rating: "5.0",
    tag: "Aventura Nocturna",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLNwZW8VGKTvJJHLDkVmcI17nGzC9tX1Pw9gIBvpAyVV5oqnIvoeQa_dZru0mMRaJW-8m6EiGQLiLlpIZ7MM1gLDQUC_W8d5yxvwC4k0jCUtjyKH8Kw4KJfLlf48tFuUPK9O_F6Kt9YFEC8URmnv9KlOp5FccaHcU2mXTg8t9aw7zl5AJYUbPqQaOcwAe5hYGk3m6ntEY1ASjWJh7q45_YRF-WeUtzqxFEEYfw1qFe85Iy0dMQPyUeTI2xx6jDV683FpFfOKewRg",
  },
];

const beachImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD2mrCNHLm92LxkC22dS9fOjVqeIDFI3MAUStYJc-XuouBbkEGyMvuv7_eEKZa8qp7uKlVG2aSQ3gEOVBeSpJ74dVv113T0AjP9XgGPYrhjsjdTXU6s0igcwsdplryr0LFn0K_rHqktHyu0M4kE4dAmFeN7fQI4cRnzsXBE9fEGnh_LIAYk7Z1RT-YYmZRjgsA_z9SIhBMwLszcnR1y7nWHvAgRn07hkt9or8cI678jcQaEUri3ktbQZ9LRBmaTw1xEJ970T6SS_w";

export default function HomePage() {
  return (
    <>
      <TopNav active="tours" />

      <main>
        <section className="relative z-30 flex min-h-screen items-center justify-center overflow-x-hidden px-4 pt-20 md:px-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-primary/40 to-background/20" />
            <Image src={heroImage} alt="Paraíso costero" fill priority className="object-cover" sizes="100vw" />
          </div>

          <div className="relative z-20 mx-auto max-w-4xl space-y-8 text-center">
            <h1 className="text-[36px] font-extrabold leading-[44px] text-white drop-shadow-lg md:text-[48px] md:leading-[56px]">
              Tu próxima aventura comienza aquí
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-7 text-white/90">
              Descubre destinos paradisíacos y experiencias inolvidables con nuestros tours curados profesionalmente.
            </p>

            <CountrySearch />
          </div>

          <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-b from-transparent via-background/65 to-background" />
          <div className="absolute bottom-0 left-0 h-8 w-full bg-background" />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-16">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="space-y-4">
              <span className="rounded-full bg-tertiary-container/10 px-4 py-1.5 text-sm font-semibold text-on-tertiary-container">
                Explora el Mundo
              </span>
              <h2 className="text-[32px] font-bold leading-[40px] text-primary">Tours Destacados</h2>
            </div>
            <Link href="/tours" className="group flex items-center gap-2 font-semibold text-primary">
              Ver todos los tours
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredTours.map((tour) => (
              <div key={tour.title} className="group overflow-hidden rounded-xl bg-surface-container-lowest coastal-shadow transition-transform duration-300 hover:-translate-y-2">
                <div className="relative h-64">
                  <Image src={tour.image} alt={tour.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                  <span className="absolute right-4 top-4 rounded-lg bg-secondary-container px-3 py-1 text-[22px] font-bold text-on-secondary-container">
                    {tour.price}
                  </span>
                  {tour.tag ? (
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-tertiary-container/90 px-3 py-1 text-sm text-on-tertiary-container backdrop-blur-md">
                        {tour.tag}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-4 p-6">
                  <h3 className="text-[22px] font-semibold text-primary">{tour.title}</h3>
                  <p className="line-clamp-2 text-on-surface-variant">{tour.description}</p>
                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        <span className="text-sm">{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">star</span>
                        <span className="text-sm">{tour.rating}</span>
                      </div>
                    </div>
                    <Link href="/tours" className="text-sm font-semibold text-primary hover:underline">
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-container py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 md:grid-cols-2 md:px-16">
            <div className="relative">
              <div className="asymmetric-shape absolute -inset-4 rotate-6 bg-primary opacity-10" />
              <Image
                src={beachImage}
                alt="Pasadía en beach club"
                width={800}
                height={1000}
                className="relative z-10 h-[500px] w-full rounded-3xl object-cover coastal-shadow"
              />
              <div className="glass-card coastal-shadow absolute -bottom-8 -right-8 z-20 hidden rounded-2xl p-6 md:block">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-secondary-container p-3">
                    <span className="material-symbols-outlined text-on-secondary-container">beach_access</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">Reserva hoy</p>
                    <p className="text-[22px] font-bold text-primary">Cupos Limitados</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <span className="rounded-full bg-secondary-container/20 px-4 py-1.5 text-sm font-semibold text-on-secondary-container">
                  Todo Incluido
                </span>
                <h2 className="text-[32px] font-bold leading-[40px] text-primary">Pasadías Populares: Relájate y Disfruta</h2>
                <p className="text-lg text-on-surface-variant">
                  Nuestros planes de día están diseñados para quienes buscan una escapada rápida sin preocupaciones.
                  Transporte, almuerzo y acceso a las mejores playas del Caribe.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined rounded-lg bg-primary p-2 text-secondary-container">check_circle</span>
                  <div>
                    <h4 className="font-bold text-primary">Pasadía en Punta Arena</h4>
                    <p className="text-on-surface-variant">Aguas cristalinas y la mejor atención de la zona.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined rounded-lg bg-primary p-2 text-secondary-container">check_circle</span>
                  <div>
                    <h4 className="font-bold text-primary">Atardecer en Playa Blanca</h4>
                    <p className="text-on-surface-variant">Disfruta del mejor atardecer con un cóctel de bienvenida.</p>
                  </div>
                </div>
              </div>
              <Link
                href="/tours"
                className="inline-block rounded-full bg-primary px-10 py-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
              >
                Explorar Pasadías
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-16">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-[32px] font-bold leading-[40px] text-primary">Por qué elegir HI TRAVEL</h2>
            <p className="mx-auto max-w-2xl text-on-surface-variant">
              Combinamos la pasión por el detalle con la seguridad de una agencia profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2 md:h-[600px]">
            <div className="group relative overflow-hidden rounded-3xl bg-primary p-8 md:col-span-2">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary-container/20 blur-3xl transition-transform duration-500 group-hover:scale-125" />
              <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-4xl text-secondary-container">groups</span>
                <h3 className="text-[22px] font-semibold text-white">Guías Certificados y Expertos</h3>
                <p className="max-w-md text-white/80">
                  No solo te llevamos al lugar, te contamos su historia. Nuestros guías son locales apasionados que
                  garantizan una experiencia auténtica y educativa.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl bg-surface-container-highest p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                <span className="material-symbols-outlined text-3xl text-primary">verified_user</span>
              </div>
              <h3 className="text-[22px] font-bold text-primary">Seguridad 100%</h3>
              <p className="text-on-surface-variant">Pólizas de seguro incluidas en todos nuestros recorridos para tu total tranquilidad.</p>
            </div>

            <div className="rounded-3xl bg-secondary-container p-8">
              <h3 className="text-[22px] font-semibold text-on-secondary-container">Soporte 24/7 vía WhatsApp</h3>
              <p className="mt-4 text-on-secondary-container/80">
                ¿Tienes dudas durante tu viaje? Nuestro equipo está listo para ayudarte en cualquier momento del día.
              </p>
              <div className="mt-6 flex -space-x-3 overflow-hidden">
                <div className="h-10 w-10 rounded-full bg-primary ring-2 ring-secondary-container" />
                <div className="h-10 w-10 rounded-full bg-primary/80 ring-2 ring-secondary-container" />
                <div className="h-10 w-10 rounded-full bg-primary/60 ring-2 ring-secondary-container" />
              </div>
            </div>

            <div className="group flex items-center gap-8 rounded-3xl border border-outline-variant/30 bg-white p-8 md:col-span-2">
              <div className="hidden h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-surface-container sm:flex group-hover:rotate-6 transition-transform">
                <span className="material-symbols-outlined text-5xl text-primary">event_available</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-[22px] font-bold text-primary">Reservas Flexibles</h3>
                <p className="text-on-surface-variant">
                  Cambia tu fecha o cancela con 24h de antelación sin cargos adicionales. Entendemos que los planes
                  pueden cambiar.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
      <WhatsappFab />
    </>
  );
}
