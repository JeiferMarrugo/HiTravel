"use client";

import { useEffect, useRef } from "react";

export function ApiDocs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;

    async function initSwagger() {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js";
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("No se pudo cargar Swagger UI."));
        document.body.appendChild(script);
      });

      if (cancelled) {
        return;
      }

      const SwaggerUIBundle = (
        window as unknown as {
          SwaggerUIBundle?: (config: Record<string, unknown>) => void;
        }
      ).SwaggerUIBundle;

      if (!SwaggerUIBundle) {
        return;
      }

      SwaggerUIBundle({
        dom_id: "#swagger-ui",
        url: "/api/openapi",
        deepLinking: true,
        persistAuthorization: true,
        tryItOutEnabled: true,
        displayRequestDuration: true,
        filter: true,
        syntaxHighlight: { activate: true, theme: "agate" },
      });
    }

    void initSwagger().catch(() => {
      if (container) {
        container.innerHTML =
          '<p class="p-8 text-center text-red-700">No se pudo cargar la documentación. Comprueba tu conexión.</p>';
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      id="swagger-ui"
      ref={containerRef}
      className="min-h-[70vh] [&_.swagger-ui]:font-sans"
    />
  );
}
