import Link from "next/link";
import { ApiDocs } from "@/components/api-docs";

export const metadata = {
  title: "Documentación API — HI TRAVEL",
  description: "OpenAPI / Swagger para integraciones con HI TRAVEL",
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <header className="border-b border-outline-variant/20 bg-primary px-4 py-6 text-on-primary md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-semibold text-secondary-container hover:underline">
              ← HI TRAVEL
            </Link>
            <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">Documentación API</h1>
            <p className="mt-1 max-w-2xl text-sm text-on-primary/80">
              OpenAPI 3 — autenticación JWT para el panel admin. Endpoints públicos sin token.
            </p>
          </div>
          <a
            href="/api/openapi"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container"
          >
            Descargar openapi.json
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-2 py-6 md:px-4">
        <div className="mb-6 rounded-2xl border border-outline-variant/20 bg-white p-6 text-sm text-on-surface-variant">
          <p className="font-semibold text-primary">Integración rápida</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              <code className="text-primary">POST /api/auth/login</code> con email y contraseña admin.
            </li>
            <li>
              Copia <code className="text-primary">accessToken</code> y en Swagger pulsa <strong>Authorize</strong> →
              pega <code>Bearer &lt;token&gt;</code>.
            </li>
            <li>Prueba los endpoints bajo <strong>Admin</strong>.</li>
          </ol>
        </div>
        <ApiDocs />
      </div>
    </div>
  );
}
