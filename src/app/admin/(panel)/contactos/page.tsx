import { ContactSubmissionsPanel } from "@/components/admin/contact-submissions-panel";

export const dynamic = "force-dynamic";

export default function AdminContactSubmissionsPage() {
  return (
    <div className="w-full min-w-0 max-w-full">
      <section className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-extrabold leading-tight text-primary sm:text-[32px] sm:leading-[40px]">
          Contactos web
        </h1>
        <p className="mt-2 text-base text-on-surface-variant sm:text-lg">
          Personas que escribieron desde la página Contáctanos. Incluye el mensaje enviado y el estado del WhatsApp
          automático.
        </p>
      </section>
      <ContactSubmissionsPanel />
    </div>
  );
}
