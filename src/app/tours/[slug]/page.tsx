import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailFooter, TopNav, WhatsappFab } from "@/components/site-chrome";
import { contactDetails, tours } from "@/lib/site-data";

type TourDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return tours.map((tour) => ({ slug: tour.slug }));
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;
  const tour = tours.find((item) => item.slug === slug);

  if (!tour) {
    notFound();
  }

  const [hero, ...gallery] = tour.gallery;

  return (
    <>
      <TopNav active="tours" />

      <main className="pb-20 pt-24">
        <section className="mx-auto mb-12 max-w-7xl px-4 md:px-16">
          <div className="grid h-[400px] grid-cols-1 grid-rows-2 gap-4 overflow-hidden rounded-xl coastal-shadow md:h-[600px] md:grid-cols-4">
            <div className="relative overflow-hidden md:col-span-2 md:row-span-2">
              <Image src={hero} alt={tour.name} fill priority className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
              <div className="absolute top-4 left-4">
                <span className="rounded-full bg-secondary-container px-3 py-1 text-sm font-semibold text-on-secondary-container">
                  {tour.badge}
                </span>
              </div>
            </div>

            {[hero, ...gallery].slice(1, 3).map((image, index) => (
              <div key={`${image}-${index}`} className="relative hidden overflow-hidden md:block">
                <Image src={image} alt={`${tour.name} ${index + 2}`} fill className="object-cover" sizes="25vw" />
              </div>
            ))}

            <div className="relative hidden overflow-hidden md:col-span-2 md:block">
              <Image src={gallery[2] ?? hero} alt={`${tour.name} reef`} fill className="object-cover" sizes="50vw" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                <span className="rounded-full border-2 border-white px-6 py-2 text-white">Ver las 24 fotos</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 md:px-16">
          <div className="flex flex-col gap-12 lg:flex-row">
            <div className="lg:w-2/3">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-tertiary-container px-3 py-1 text-sm font-semibold uppercase tracking-wider text-on-tertiary-container">
                  {tour.category}
                </span>
                <div className="flex items-center text-secondary">
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="material-symbols-outlined">star_half</span>
                  <span className="ml-2 text-sm font-semibold text-on-surface-variant">
                    {tour.rating.toFixed(1)} ({tour.reviews} reseñas)
                  </span>
                </div>
              </div>

              <h1 className="mb-6 text-[36px] font-extrabold leading-[44px] text-primary md:text-[48px] md:leading-[56px]">
                {tour.name}
              </h1>

              <div className="mb-8 flex flex-wrap gap-8 border-y border-outline-variant/30 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-primary">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface-variant">Duración</p>
                    <p className="text-[22px] font-semibold text-primary">{tour.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-primary">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface-variant">Tamaño del grupo</p>
                    <p className="text-[22px] font-semibold text-primary">{tour.groupSize}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-primary">
                    <span className="material-symbols-outlined">language</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface-variant">Idiomas</p>
                    <p className="text-[22px] font-semibold text-primary">{tour.languages}</p>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="mb-4 text-[32px] font-bold leading-[40px] text-primary">Resumen</h3>
                {tour.longDescription.map((paragraph) => (
                  <p key={paragraph} className="mb-6 text-[18px] leading-7 text-on-surface-variant last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mb-12">
                <h3 className="mb-8 text-[32px] font-bold leading-[40px] text-primary">Itinerario del viaje</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {tour.itinerary.map((stop, index) => (
                    <div
                      key={`${stop.time}-${stop.title}`}
                      className={`rounded-xl p-6 ${
                        index === 0
                          ? "border-l-4 border-primary bg-surface-container-low"
                          : index === 3
                            ? "border-l-4 border-secondary bg-surface-container-low"
                            : "border border-outline-variant/30 bg-white coastal-shadow"
                      }`}
                    >
                      <span className={`text-sm font-semibold uppercase ${index === 3 ? "text-secondary" : "text-primary"}`}>
                        {stop.time}
                      </span>
                      <h4 className="mb-2 mt-1 text-[22px] font-semibold text-primary">{stop.title}</h4>
                      <p className="text-on-surface-variant">{stop.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12 rounded-3xl bg-primary p-8 text-on-primary md:grid-cols-2">
                <div>
                  <h4 className="mb-6 flex items-center gap-2 text-[22px] font-semibold text-secondary-container">
                    <span className="material-symbols-outlined">check_circle</span> Qué incluye
                  </h4>
                  <ul className="space-y-4">
                    {tour.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="material-symbols-outlined mt-1 text-sm text-secondary-container">done</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-6 flex items-center gap-2 text-[22px] font-semibold text-white/60">
                    <span className="material-symbols-outlined">cancel</span> No incluye
                  </h4>
                  <ul className="space-y-4 opacity-80">
                    {tour.excludes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="material-symbols-outlined mt-1 text-sm">close</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="sticky top-28 rounded-3xl border border-outline-variant/30 bg-white p-8 coastal-shadow">
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-on-surface-variant">Precio desde</p>
                    <h2 className="text-[36px] font-extrabold leading-[44px] text-primary">
                      ${tour.price}
                      <span className="text-base font-normal text-on-surface-variant">/persona</span>
                    </h2>
                  </div>
                  <div className="mb-2 rounded-lg bg-secondary-container px-3 py-1 text-sm font-bold text-on-secondary-container">
                    AHORRA 15%
                  </div>
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-primary">Fecha de viaje</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                        calendar_month
                      </span>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-3 pl-12 pr-4 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary">Adultos (12+)</label>
                      <select className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none">
                        <option>1</option>
                        <option selected>2</option>
                        <option>3</option>
                        <option>4</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-primary">Niños</label>
                      <select className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 outline-none">
                        <option selected>0</option>
                        <option>1</option>
                        <option>2</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-outline-variant/20 pt-4">
                    <div className="flex justify-between text-sm">
                      <span>$120.00 x 2 adultos</span>
                      <span>$240.00</span>
                    </div>
                    <div className="flex justify-between text-sm text-on-tertiary-container">
                      <span>Descuento (15%)</span>
                      <span>-$36.00</span>
                    </div>
                    <div className="flex justify-between pt-2 text-[22px] font-semibold text-primary">
                      <span>Precio total</span>
                      <span>$204.00</span>
                    </div>
                  </div>

                  <Link
                    href="/contacto"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-4 text-[22px] font-semibold text-on-secondary-container transition-all hover:shadow-lg"
                  >
                    <span className="material-symbols-outlined">bolt</span>
                    Reservar ahora
                  </Link>
                  <p className="text-center text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-base">verified_user</span> Reserva segura. Sin cargos ocultos.
                  </p>
                </form>

                <div className="mt-8 flex items-center gap-4 rounded-2xl bg-surface-container-low p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <span className="material-symbols-outlined text-primary">chat</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">¿Necesitas un plan personalizado?</p>
                    <a href={contactDetails.whatsapp} className="text-sm text-on-surface-variant">
                      Habla con un asesor de viajes
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <DetailFooter />
      <WhatsappFab />
    </>
  );
}
