import Image from "next/image";
import Link from "next/link";
import { HomeFooter, TopNav, WhatsappFab } from "@/components/site-chrome";
import { getVisitorPricingContext } from "@/lib/pricing/visitor-currency";
import { isUploadedSiteImage } from "@/lib/site-content/utils";

export const dynamic = "force-dynamic";

export default async function NosotrosPage() {
  const { content, displayCurrency } = await getVisitorPricingContext();
  const { about } = content;

  return (
    <>
      <TopNav content={content} active="about" displayCurrency={displayCurrency} />

      <main className="pb-20 pt-24">
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-16">
          <div className="relative overflow-hidden rounded-[2rem] coastal-shadow">
            <div className="relative h-[420px]">
              <Image
                src={about.heroImageUrl}
                alt={about.heroTitle}
                fill
                priority
                className="object-cover"
                sizes="100vw"
                unoptimized={isUploadedSiteImage(about.heroImageUrl)}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/55 to-primary/20" />
              <div className="absolute inset-0 flex items-center p-8 md:p-14">
                <div className="max-w-3xl text-white">
                  <span className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-md">
                    {about.heroBadge}
                  </span>
                  <h1 className="text-[36px] font-extrabold leading-[44px] md:text-[48px] md:leading-[56px]">
                    {about.heroTitle}
                  </h1>
                  <p className="mt-5 max-w-2xl text-[18px] leading-7 text-white/90">{about.heroSubtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-16">
          <div className="space-y-6">
            <span className="rounded-full bg-tertiary-container/10 px-4 py-1.5 text-sm font-semibold text-on-tertiary-container">
              {about.storyBadge}
            </span>
            <h2 className="text-[32px] font-bold leading-[40px] text-primary">{about.storyTitle}</h2>
            <p className="text-[18px] leading-8 text-on-surface-variant">{about.storyParagraph1}</p>
            <p className="text-[18px] leading-8 text-on-surface-variant">{about.storyParagraph2}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
            {about.stats.map((stat) => (
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
              <h2 className="text-[32px] font-bold leading-[40px] text-primary">{about.valuesTitle}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-on-surface-variant">{about.valuesSubtitle}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {about.values.map((value) => (
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
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-container">
                {about.missionLabel}
              </span>
              <p className="mt-4 text-[22px] leading-8">{about.missionText}</p>
            </div>

            <div className="rounded-[2rem] border border-outline-variant/30 bg-white p-10 coastal-shadow">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{about.visionLabel}</span>
              <p className="mt-4 text-[22px] leading-8 text-on-surface">{about.visionText}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-6 md:px-16">
          <div className="rounded-[2rem] bg-primary px-8 py-10 text-white md:px-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-container">{about.ctaEyebrow}</p>
                <h2 className="text-3xl font-extrabold md:text-4xl">{about.ctaTitle}</h2>
                <p className="max-w-2xl text-white/80">{about.ctaText}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/tours"
                  className="rounded-full bg-secondary-container px-6 py-3 text-center text-sm font-bold text-on-secondary-container"
                >
                  {about.ctaPrimaryLabel}
                </Link>
                <Link
                  href="/contacto"
                  className="rounded-full border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white"
                >
                  {about.ctaSecondaryLabel}
                </Link>
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
