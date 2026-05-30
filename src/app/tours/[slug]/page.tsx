import Image from "next/image";
import { notFound } from "next/navigation";
import { DetailFooter, TopNav, WhatsappFab } from "@/components/site-chrome";
import { TourBookingPanel, TourDetailRating } from "@/components/tour-booking-panel";
import { TourReviewsSection } from "@/components/tour-reviews-section";
import { getPublicTourBySlug, isUploadedImage } from "@/lib/catalog/public";
import { getVisitorPricingContext } from "@/lib/pricing/visitor-currency";

export const dynamic = "force-dynamic";

type TourDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { slug } = await params;
  const { content, displayCurrency, usdCopRate } = await getVisitorPricingContext();
  const tour = await getPublicTourBySlug(slug);

  if (!tour) {
    notFound();
  }

  const [hero, ...gallery] = tour.gallery;
  const galleryCount = tour.gallery.length;

  return (
    <>
      <TopNav content={content} active="tours" />

      <main className="pb-20 pt-24"> 
        <section className="mx-auto mb-12 max-w-7xl px-4 md:px-16">
          <div className="grid h-[400px] grid-cols-1 grid-rows-2 gap-4 overflow-hidden rounded-xl coastal-shadow md:h-[600px] md:grid-cols-4">
            <div className="relative overflow-hidden md:col-span-2 md:row-span-2">
              <Image
                src={hero}
                alt={tour.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width:768px) 100vw, 50vw"
                unoptimized={isUploadedImage(hero)}
              />
              <div className="absolute top-4 left-4">
                <span className="rounded-full bg-secondary-container px-3 py-1 text-sm font-semibold text-on-secondary-container">
                  {tour.badge}
                </span>
              </div>
            </div>

            {[hero, ...gallery].slice(1, 3).map((image, index) => (
              <div key={`${image}-${index}`} className="relative hidden overflow-hidden md:block">
                <Image
                  src={image}
                  alt={`${tour.name} ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="25vw"
                  unoptimized={isUploadedImage(image)}
                />
              </div>
            ))}

            <div className="relative hidden overflow-hidden md:col-span-2 md:block">
              <Image
                src={gallery[2] ?? hero}
                alt={`${tour.name} reef`}
                fill
                className="object-cover"
                sizes="50vw"
                unoptimized={isUploadedImage(gallery[2] ?? hero)}
              />
              {galleryCount > 1 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                  <span className="rounded-full border-2 border-white px-6 py-2 text-white">
                    Ver las {galleryCount} fotos
                  </span>
                </div>
              ) : null}
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
                <TourDetailRating rating={tour.rating} reviews={tour.reviews} />
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
                {tour.itinerary.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {tour.itinerary.map((stop, index) => (
                      <div
                        key={`${stop.time}-${stop.title}`}
                        className={`rounded-xl p-6 ${
                          stop.featured || index === 0
                            ? "border-l-4 border-primary bg-surface-container-low"
                            : "border border-outline-variant/30 bg-white coastal-shadow"
                        }`}
                      >
                        <span className="text-sm font-semibold uppercase text-primary">{stop.time}</span>
                        <h4 className="mb-2 mt-1 text-[22px] font-semibold text-primary">{stop.title}</h4>
                        <p className="text-on-surface-variant">{stop.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-on-surface-variant">
                    El itinerario detallado de esta experiencia se publicará pronto. Escríbenos para conocer el
                    horario del día.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-10 rounded-[2rem] bg-primary p-8 text-on-primary md:grid-cols-2 md:gap-12 md:p-10">
                <div>
                  <h4 className="mb-5 flex items-center gap-2.5 text-[22px] font-semibold text-secondary-container">
                    <span className="material-symbols-outlined text-secondary-container">check_circle</span>
                    Qué incluye
                  </h4>
                  <ul className="space-y-3.5">
                    {tour.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="material-symbols-outlined mt-1 text-sm text-secondary-container">done</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-5 flex items-center gap-2.5 text-[22px] font-semibold text-white/70">
                    <span className="material-symbols-outlined">cancel</span>
                    No incluye
                  </h4>
                  <ul className="space-y-3.5 text-white/90">
                    {tour.excludes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="material-symbols-outlined mt-1 text-sm">close</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <TourReviewsSection
                reviews={tour.topGuestReviews}
                averageRating={tour.rating}
                reviewCount={tour.reviews}
              />
            </div>

            <div className="lg:w-1/3">
              <TourBookingPanel
                slug={slug}
                priceFromCents={tour.priceFromCents}
                storedCurrency={tour.currency}
                displayCurrency={displayCurrency}
                usdCopRate={usdCopRate}
                contactHref="/contacto"
                topReviews={tour.topGuestReviews}
                reviewRating={tour.rating}
                reviewCount={tour.reviews}
              />
            </div>
          </div>
        </section>
      </main>

      <DetailFooter content={content} />
      <WhatsappFab content={content} />
    </>
  );
}
