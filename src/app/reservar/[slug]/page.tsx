import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicBookingForm } from "@/components/public-booking-form";
import { TopNav, WhatsappFab } from "@/components/site-chrome";
import { getPublicTourBySlug } from "@/lib/catalog/public";
import { getVisitorPricingContext } from "@/lib/pricing/visitor-currency";

type ReservarPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ adultos?: string; ninos?: string; fecha?: string }>;
};

export default async function ReservarPage({ params, searchParams }: ReservarPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const { content, displayCurrency, usdCopRate } = await getVisitorPricingContext();
  const tour = await getPublicTourBySlug(slug);

  if (!tour) {
    notFound();
  }

  return (
    <>
      <TopNav content={content} active="tours" displayCurrency={displayCurrency} />
      <main className="section-shell py-10 md:py-14">
        <Link href={`/tours/${slug}`} className="mb-6 inline-flex text-sm font-semibold text-primary hover:underline">
          ← Volver al tour
        </Link>
        <PublicBookingForm
          tourSlug={slug}
          tourName={tour.name}
          storedCurrency={tour.currency}
          displayCurrency={displayCurrency}
          usdCopRate={usdCopRate}
          initialAdults={Math.max(1, Number(query.adultos) || 2)}
          initialChildren={Math.max(0, Number(query.ninos) || 0)}
          initialCheckinAt={query.fecha ?? ""}
        />
      </main>
      <WhatsappFab content={content} />
    </>
  );
}
