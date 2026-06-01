import { CatalogOptionsConfig } from "@/components/admin/catalog-options-config";
import { IdTypesConfig } from "@/components/admin/id-types-config";
import { SiteContentConfig } from "@/components/admin/site-content-config";
import { WhatsAppNotificationsConfig } from "@/components/admin/whatsapp-notifications-config";
import { getCatalogOptions } from "@/lib/catalog/catalog-options";
import { listIdTypes } from "@/lib/catalog/id-types";
import { getSiteContent } from "@/lib/site-content/store";
import { getWhatsAppConfig } from "@/lib/whatsapp/config";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [catalog, idTypes, siteContent, whatsappConfig] = await Promise.all([
    getCatalogOptions(),
    listIdTypes(),
    getSiteContent(),
    getWhatsAppConfig(),
  ]);

  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Configuración</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Catálogo de tours, contenido del sitio y notificaciones WhatsApp.
        </p>
      </section>

      <section className="space-y-6">
        <CatalogOptionsConfig initialData={catalog} />
        <IdTypesConfig initialIdTypes={idTypes} />
        <SiteContentConfig initialContent={siteContent} />
        <WhatsAppNotificationsConfig initialConfig={whatsappConfig} />
      </section>
    </div>
  );
}
