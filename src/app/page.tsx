import Image from "next/image";
import Link from "next/link";
import { CountrySearch } from "@/components/country-search";
import { HomeFooter, TopNav, WhatsappFab } from "@/components/site-chrome";
import { getFeaturedPublicTours, isUploadedImage } from "@/lib/catalog/public";
import { formatVisitorPrice, getVisitorPricingContext } from "@/lib/pricing/visitor-currency";
import { isUploadedSiteImage } from "@/lib/site-content/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { content, displayCurrency, usdCopRate } = await getVisitorPricingContext();
  const featuredTours = await getFeaturedPublicTours(3);
  const { home } = content;

  return (
    <>
      <TopNav content={content} active="tours" displayCurrency={displayCurrency} />

      <main>
        <section className="relative z-30 flex min-h-screen items-center justify-center overflow-x-hidden px-4 pt-20 md:px-16">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-primary/40 to-background/20" />
            <Image
              src={home.heroImageUrl}
              alt={home.heroTitle}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              unoptimized={isUploadedSiteImage(home.heroImageUrl)}
            />
          </div>

          <div className="relative z-20 mx-auto max-w-4xl space-y-8 text-center">
            <h1 className="text-[36px] font-extrabold leading-[44px] text-white drop-shadow-lg md:text-[48px] md:leading-[56px]">
              {home.heroTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-7 text-white/90">{home.heroSubtitle}</p>
            <CountrySearch countries={content.searchCountries} />
          </div>

          <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-b from-transparent via-background/65 to-background" />
          <div className="absolute bottom-0 left-0 h-8 w-full bg-background" />
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-16">
          <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="space-y-4">
              <span className="rounded-full bg-tertiary-container/10 px-4 py-1.5 text-sm font-semibold text-on-tertiary-container">
                {home.featuredBadge}
              </span>
              <h2 className="text-[32px] font-bold leading-[40px] text-primary">{home.featuredTitle}</h2>
            </div>
            <Link href="/tours" className="group flex items-center gap-2 font-semibold text-primary">
              {home.featuredLinkLabel}
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredTours.length === 0 ? (
              <p className="col-span-full rounded-2xl bg-surface-container-low p-8 text-center text-on-surface-variant">
                Publica experiencias en el panel admin (activas y, opcionalmente, destacadas) para mostrarlas aquí.
              </p>
            ) : null}
            {featuredTours.map((tour) => (
              <div key={tour.slug} className="group overflow-hidden rounded-xl bg-surface-container-lowest coastal-shadow transition-transform duration-300 hover:-translate-y-2">
                <div className="relative h-64">
                  <Image
                    src={tour.heroImage}
                    alt={tour.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                    unoptimized={isUploadedImage(tour.heroImage)}
                  />
                  <span className="absolute right-4 top-4 rounded-lg bg-secondary-container px-3 py-1 text-sm font-bold text-on-secondary-container">
                    {formatVisitorPrice(tour.priceFromCents, tour.currency, displayCurrency, usdCopRate)}
                  </span>
                  {tour.badge ? (
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-tertiary-container/90 px-3 py-1 text-sm text-on-tertiary-container backdrop-blur-md">
                        {tour.badge}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="space-y-4 p-6">
                  <h3 className="text-[22px] font-semibold text-primary">{tour.name}</h3>
                  <p className="line-clamp-2 text-on-surface-variant">{tour.description}</p>
                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        <span className="text-sm">{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">star</span>
                        <span className="text-sm">{tour.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <Link href={`/tours/${tour.slug}`} className="text-sm font-semibold text-primary hover:underline">
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
                src={home.dayTripsImageUrl}
                alt={home.dayTripsTitle}
                width={800}
                height={1000}
                className="relative z-10 h-[500px] w-full rounded-3xl object-cover coastal-shadow"
                unoptimized={isUploadedSiteImage(home.dayTripsImageUrl)}
              />
              <div className="glass-card coastal-shadow absolute -bottom-8 -right-8 z-20 hidden rounded-2xl p-6 md:block">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-secondary-container p-3">
                    <span className="material-symbols-outlined text-on-secondary-container">beach_access</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">{home.dayTripsCardSubtitle}</p>
                    <p className="text-[22px] font-bold text-primary">{home.dayTripsCardTitle}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <span className="rounded-full bg-secondary-container/20 px-4 py-1.5 text-sm font-semibold text-on-secondary-container">
                  {home.dayTripsBadge}
                </span>
                <h2 className="text-[32px] font-bold leading-[40px] text-primary">{home.dayTripsTitle}</h2>
                <p className="text-lg text-on-surface-variant">{home.dayTripsDescription}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined rounded-lg bg-primary p-2 text-secondary-container">check_circle</span>
                  <div>
                    <h4 className="font-bold text-primary">{home.dayTripsHighlight1Title}</h4>
                    <p className="text-on-surface-variant">{home.dayTripsHighlight1Text}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined rounded-lg bg-primary p-2 text-secondary-container">check_circle</span>
                  <div>
                    <h4 className="font-bold text-primary">{home.dayTripsHighlight2Title}</h4>
                    <p className="text-on-surface-variant">{home.dayTripsHighlight2Text}</p>
                  </div>
                </div>
              </div>
              <Link
                href="/tours"
                className="inline-block rounded-full bg-primary px-10 py-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
              >
                {home.dayTripsCtaLabel}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 md:px-16">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-[32px] font-bold leading-[40px] text-primary">{home.whyTitle}</h2>
            <p className="mx-auto max-w-2xl text-on-surface-variant">{home.whySubtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2 md:h-[600px]">
            <div className="group relative overflow-hidden rounded-3xl bg-primary p-8 md:col-span-2">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary-container/20 blur-3xl transition-transform duration-500 group-hover:scale-125" />
              <div className="relative z-10 space-y-4">
                <span className="material-symbols-outlined text-4xl text-secondary-container">groups</span>
                <h3 className="text-[22px] font-semibold text-white">{home.whyGuidesTitle}</h3>
                <p className="max-w-md text-white/80">{home.whyGuidesText}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl bg-surface-container-highest p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                <span className="material-symbols-outlined text-3xl text-primary">verified_user</span>
              </div>
              <h3 className="text-[22px] font-bold text-primary">{home.whySafetyTitle}</h3>
              <p className="text-on-surface-variant">{home.whySafetyText}</p>
            </div>

            <div className="rounded-3xl bg-secondary-container p-8">
              <h3 className="text-[22px] font-semibold text-on-secondary-container">{home.whyWhatsappTitle}</h3>
              <p className="mt-4 text-on-secondary-container/80">{home.whyWhatsappText}</p>
            </div>

            <div className="group flex items-center gap-8 rounded-3xl border border-outline-variant/30 bg-white p-8 md:col-span-2">
              <div className="hidden h-32 w-32 flex-shrink-0 items-center justify-center rounded-2xl bg-surface-container sm:flex group-hover:rotate-6 transition-transform">
                <span className="material-symbols-outlined text-5xl text-primary">event_available</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-[22px] font-bold text-primary">{home.whyFlexibleTitle}</h3>
                <p className="text-on-surface-variant">{home.whyFlexibleText}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter content={content} />
      <WhatsappFab content={content} />
    </>
  );
}
