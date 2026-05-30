import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { TopNav, WhatsappFab } from "@/components/site-chrome";
import { getReviewInviteByToken } from "@/lib/catalog/tour-reviews";
import { getVisitorPricingContext } from "@/lib/pricing/visitor-currency";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { token } = await params;
  const invite = await getReviewInviteByToken(token);

  if (!invite) {
    notFound();
  }

  const { content, displayCurrency } = await getVisitorPricingContext();

  return (
    <>
      <TopNav content={content} active="tours" displayCurrency={displayCurrency} />

      <main className="min-h-screen bg-gradient-to-b from-surface-container-low to-surface-container-lowest pb-20 pt-28">
        <div className="mx-auto max-w-2xl px-4 md:px-6">
          <div className="mb-8 text-center">
            <Link href="/" className="text-sm font-semibold text-primary hover:underline">
              ← HI TRAVEL
            </Link>
          </div>
          <ReviewForm
            token={invite.token}
            customerName={invite.customerName}
            tourName={invite.tourName}
            bookingCode={invite.bookingCode}
            tourSlug={invite.tourSlug}
            alreadyReviewed={invite.alreadyReviewed}
            expired={invite.expired}
          />
        </div>
      </main>

      <WhatsappFab content={content} />
    </>
  );
}
