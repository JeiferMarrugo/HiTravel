import { PromotionsManager } from "@/components/admin/promotions-manager";
import { listPromotions } from "@/lib/catalog/promotions";
import { listTours } from "@/lib/catalog/tours";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const [promotions, tours] = await Promise.all([listPromotions(), listTours()]);

  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Promociones</h1>
        <p className="mt-2 text-lg text-on-surface-variant">Descuentos y beneficios para tus reservas.</p>
      </section>
      <PromotionsManager initialPromotions={promotions} initialTours={tours} />
    </div>
  );
}
