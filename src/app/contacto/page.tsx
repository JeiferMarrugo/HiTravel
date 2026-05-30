import Image from "next/image";
import { ContactForm } from "@/components/contact-form";
import { ContactFooter, TopNav, WhatsappFab } from "@/components/site-chrome";
import { getVisitorPricingContext } from "@/lib/pricing/visitor-currency";
import { isUploadedSiteImage } from "@/lib/site-content/utils";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { content, displayCurrency } = await getVisitorPricingContext();
  const { contact, contactPage, social } = content;

  return (
    <>
      <TopNav content={content} active="contact" displayCurrency={displayCurrency} />

      <main className="pb-20 pt-32">
        <section className="mx-auto mb-16 max-w-7xl px-4 md:px-16">
          <div className="relative h-[400px] overflow-hidden rounded-xl coastal-shadow">
            <Image
              src={contactPage.heroImageUrl}
              alt={contactPage.heroTitle}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              unoptimized={isUploadedSiteImage(contactPage.heroImageUrl)}
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/60 to-transparent p-8 md:p-12">
              <h1 className="mb-4 text-[36px] font-extrabold leading-[44px] text-surface-container-lowest md:text-[48px] md:leading-[56px]">
                {contactPage.heroTitle}
              </h1>
              <p className="max-w-2xl text-[18px] leading-7 text-surface-container-lowest/90">
                {contactPage.heroSubtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:px-16 lg:grid-cols-12">
          <div className="coastal-shadow rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-8 md:p-12 lg:col-span-7">
            <h2 className="mb-8 text-[32px] font-bold leading-[40px] text-primary">{contactPage.formTitle}</h2>
            <ContactForm />
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="coastal-shadow relative overflow-hidden rounded-xl bg-primary p-8 text-on-primary md:p-10">
              <div className="relative z-10 space-y-6">
                <h3 className="text-[32px] font-bold leading-[40px] text-secondary-container">{contactPage.officeTitle}</h3>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-secondary-container">location_on</span>
                  <p className="text-base">
                    {contact.address}
                    <br />
                    {contact.addressLine2}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary-container">call</span>
                  <p className="text-base">{contact.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary-container">mail</span>
                  <p className="text-base">{contact.email}</p>
                </div>
                <div className="border-t border-on-primary/10 pt-6">
                  <p className="mb-4 text-sm uppercase tracking-widest text-on-primary/60">{contactPage.socialEyebrow}</p>
                  <div className="flex gap-4">
                    <a className="flex h-10 w-10 items-center justify-center rounded-full border border-on-primary/20 transition-all hover:bg-secondary-container hover:text-on-secondary-container" href={social.facebook}>
                      <span className="material-symbols-outlined text-base">social_leaderboard</span>
                    </a>
                    <a className="flex h-10 w-10 items-center justify-center rounded-full border border-on-primary/20 transition-all hover:bg-secondary-container hover:text-on-secondary-container" href={social.instagram}>
                      <span className="material-symbols-outlined text-base">camera</span>
                    </a>
                    <a className="flex h-10 w-10 items-center justify-center rounded-full border border-on-primary/20 transition-all hover:bg-secondary-container hover:text-on-secondary-container" href={social.youtube}>
                      <span className="material-symbols-outlined text-base">video_library</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative h-[300px] overflow-hidden rounded-xl coastal-shadow">
              <div className="relative flex h-full items-center justify-center overflow-hidden bg-surface-container-high">
                <Image
                  src={contact.mapImageUrl}
                  alt="Mapa de la oficina"
                  fill
                  className="object-cover opacity-80"
                  sizes="(max-width:1024px) 100vw, 40vw"
                  unoptimized={isUploadedSiteImage(contact.mapImageUrl)}
                />
                <div className="absolute inset-0 bg-primary/10 transition-colors duration-500 group-hover:bg-transparent" />
                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container shadow-lg">
                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                      location_on
                    </span>
                  </div>
                  <div className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-primary shadow-sm">
                    {content.brand.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ContactFooter content={content} />
      <WhatsappFab content={content} />
    </>
  );
}
