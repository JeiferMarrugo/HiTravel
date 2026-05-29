import Image from "next/image";
import Link from "next/link";
import { HomeFooter, TopNav, WhatsappFab } from "@/components/site-chrome";

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCpWt9hXp92Vh_WU3xK4jMeCco-lqA59em3Pw9VYIzpH70cYB8voOp4Ce07zSnWhEZInLypop3yNZhyjcuO6XBjN87TYIgtlILroBST-1XRH_ymVnSH17jU9GPkIaen8viYaZ_Nmtz2CVD9MOkrhyjnpbaPRqSLPOA7epF-KNXKX40ep543ch9CyUdYLuRk_uFiNPts6z0DYZVn1Pk1TnNhOQqrxr2h0NkLKCtWrjcTFFfwTU93oCVN1s0XQ4e5MmPtfyI1L2xuPA";

const values = [
  {
    title: "Curaduría con detalle",
    description:
      "Diseñamos experiencias que equilibran estética, operación confiable y momentos memorables para cada tipo de viajero.",
  },
  {
    title: "Acompañamiento humano",
    description:
      "Nuestro equipo asesora antes, durante y después de la reserva para que el viaje se sienta claro y seguro.",
  },
  {
    title: "Aliados locales",
    description:
      "Trabajamos con operadores y anfitriones del Caribe colombiano para ofrecer experiencias más auténticas y consistentes.",
  },
];

const stats = [
  { value: "4.9/5", label: "calificación promedio" },
  { value: "+1.200", label: "viajeros atendidos" },
  { value: "24/7", label: "soporte por WhatsApp" },
];

export default function NosotrosPage() {
  return (
    <>
      <TopNav active="about" />

      <main className="pb-20 pt-24">
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-16">
          <div className="relative overflow-hidden rounded-[2rem] coastal-shadow">
            <div className="relative h-[420px]">
              <Image src={heroImage} alt="Equipo de HI TRAVEL" fill priority className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/55 to-primary/20" />
              <div className="absolute inset-0 flex items-center p-8 md:p-14">
                <div className="max-w-3xl text-white">
                  <span className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
                    Sobre nosotros
                  </span>
                  <h1 className="text-[36px] font-extrabold leading-[44px] md:text-[48px] md:leading-[56px]">
                    Creamos experiencias memorables en el Caribe colombiano
                  </h1>
                  <p className="mt-5 max-w-2xl text-[18px] leading-7 text-white/90">
                    En HI TRAVEL combinamos curaduría visual, operación confiable y atención cercana para convertir un
                    tour en una experiencia que quieras repetir y recomendar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-16">
          <div className="space-y-6">
            <span className="rounded-full bg-tertiary-container/10 px-4 py-1.5 text-sm font-semibold text-on-tertiary-container">
              Nuestra historia
            </span>
            <h2 className="text-[32px] font-bold leading-[40px] text-primary">Nacimos para vender el Caribe con más intención</h2>
            <p className="text-[18px] leading-8 text-on-surface-variant">
              HI TRAVEL surge de una idea simple: los viajeros no solo compran un traslado o una entrada, compran la
              confianza de que el plan estará bien armado, se verá bien y se sentirá aún mejor cuando lo vivan.
            </p>
            <p className="text-[18px] leading-8 text-on-surface-variant">
              Por eso construimos una marca enfocada en claridad, hospitalidad y selección cuidadosa de experiencias en
              Cartagena, Barú, Rosario y Tayrona. Queremos que cada interacción, desde la primera visita al sitio hasta
              el regreso del tour, transmita seguridad y deseo de viajar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-[2rem] bg-white p-8 coastal-shadow">
                <p className="text-4xl font-extrabold text-primary">{stat.value}</p>
                <p className="mt-3 text-sm uppercase tracking-[0.2em] text-on-surface-variant">{stat.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-surface-container py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-16">
            <div className="mb-12 text-center">
              <h2 className="text-[32px] font-bold leading-[40px] text-primary">Lo que nos define</h2>
              <p className="mx-auto mt-4 max-w-2xl text-on-surface-variant">
                Cada decisión de producto, diseño y operación está pensada para que el viaje se sienta claro, premium y
                cercano.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {values.map((value) => (
                <article key={value.title} className="rounded-[2rem] bg-white p-8 coastal-shadow">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <h3 className="text-[22px] font-semibold text-primary">{value.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-[2rem] bg-primary p-10 text-white">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-container">Misión</span>
              <p className="mt-4 text-[22px] leading-8">
                Diseñar y comercializar tours y pasadías con una experiencia de marca sólida, atención humana y
                ejecución confiable en cada detalle.
              </p>
            </div>

            <div className="rounded-[2rem] border border-outline-variant/30 bg-white p-10 coastal-shadow">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Visión</span>
              <p className="mt-4 text-[22px] leading-8 text-on-surface">
                Convertirnos en una referencia regional para viajeros que buscan una forma más clara, estética y segura
                de descubrir el Caribe colombiano.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-6 md:px-16">
          <div className="rounded-[2rem] bg-primary px-8 py-10 text-white md:px-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-container">Viaja con nosotros</p>
                <h2 className="text-3xl font-extrabold md:text-4xl">Listos para ayudarte a planear tu próxima salida</h2>
                <p className="max-w-2xl text-white/80">
                  Si quieres cotizar un plan, resolver dudas o armar una experiencia personalizada, nuestro equipo está
                  listo para acompañarte.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/tours"
                  className="rounded-full bg-secondary-container px-6 py-3 text-center text-sm font-bold text-on-secondary-container"
                >
                  Ver tours
                </Link>
                <Link
                  href="/contacto"
                  className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white"
                >
                  Hablar con un asesor
                </Link>
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
