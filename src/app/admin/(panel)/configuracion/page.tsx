"use client";

import { CatalogOptionsConfig } from "@/components/admin/catalog-options-config";
import { IdTypesConfig } from "@/components/admin/id-types-config";
import { SiteContentConfig } from "@/components/admin/site-content-config";
import { WhatsAppNotificationsConfig } from "@/components/admin/whatsapp-notifications-config";

export default function AdminSettingsPage() {
  return (
    <div className="w-full">
      <section className="mb-8">
        <h1 className="text-[32px] font-extrabold leading-[40px] text-primary">Configuración</h1>
        <p className="mt-2 text-lg text-on-surface-variant">
          Catálogo de tours, contenido del sitio y notificaciones WhatsApp.
        </p>
      </section>

      <section className="space-y-6">
        <CatalogOptionsConfig />
        <IdTypesConfig />
        <SiteContentConfig />
        <WhatsAppNotificationsConfig />
      </section>
    </div>
  );
}
