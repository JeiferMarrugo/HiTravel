import { PromotionsManager } from "@/components/admin/promotions-manager";

export const dynamic = "force-dynamic";

export default function AdminPromotionsPage() {
  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Promociones</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Descuentos y beneficios para tus reservas.
        </p>
      </section>
      <PromotionsManager />
    </div>
  );
}
