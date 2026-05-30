import type { OpenAPIV3 } from "./types";

const serverUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const openApiSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "HI TRAVEL API",
    version: "1.0.0",
    description: [
      "API del sitio y panel administrativo de HI TRAVEL.",
      "",
      "## Autenticación (panel / integraciones)",
      "1. `POST /api/auth/login` con email y contraseña de administrador.",
      "2. Usa el `accessToken` (JWT) en el header: `Authorization: Bearer <token>`.",
      "3. El token expira tras **30 minutos** de inactividad; vuelve a iniciar sesión.",
      "",
      "En el navegador del panel también se guarda una cookie `hitravel_admin_session` (mismo JWT).",
      "",
      "## Endpoints públicos",
      "No requieren JWT. Pensados para el sitio web y formularios.",
      "",
      "## Cron",
      "Protegidos con `?secret=` o `Authorization: Bearer` igual a `OPENWA_WATCHDOG_SECRET`.",
    ].join("\n"),
    contact: {
      name: "HI TRAVEL",
    },
  },
  servers: [{ url: serverUrl, description: "Servidor actual" }],
  tags: [
    { name: "Auth", description: "Inicio de sesión administrador (JWT)" },
    { name: "Public", description: "Sitio público — sin autenticación" },
    { name: "Admin — Tours", description: "Catálogo de experiencias (requiere JWT)" },
    { name: "Admin — Reservas", description: "Reservas y pagos (requiere JWT)" },
    { name: "Admin — Promociones", description: "Promociones (requiere JWT)" },
    { name: "Admin — Configuración", description: "Contenido, catálogo, WhatsApp (requiere JWT)" },
    { name: "Cron", description: "Tareas programadas (secreto)" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token devuelto por POST /api/auth/login (campo accessToken).",
      },
      cronSecret: {
        type: "apiKey",
        in: "query",
        name: "secret",
        description: "Mismo valor que OPENWA_WATCHDOG_SECRET en el servidor.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
        required: ["email", "password"],
      },
      LoginResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string" },
              name: { type: "string" },
              role: { type: "string" },
            },
          },
          accessToken: { type: "string", description: "JWT para Authorization: Bearer" },
          tokenType: { type: "string", example: "Bearer" },
          expiresIn: { type: "integer", example: 1800 },
          message: { type: "string" },
        },
      },
      TourQuoteRequest: {
        type: "object",
        properties: {
          slug: { type: "string", example: "dia-playa-baru" },
          adults: { type: "integer", minimum: 1 },
          children: { type: "integer", minimum: 0 },
          checkinAt: { type: "string", format: "date" },
        },
        required: ["slug"],
      },
      ReviewSubmit: {
        type: "object",
        properties: {
          token: { type: "string" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", minLength: 10 },
        },
        required: ["token", "rating", "comment"],
      },
    },
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión (obtener JWT)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          "200": {
            description: "JWT emitido",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } },
            },
          },
          "401": { description: "Credenciales inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Usuario de la sesión actual",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Sesión válida" },
          "401": { description: "No autorizado" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Cerrar sesión",
        responses: { "200": { description: "Sesión cerrada" } },
      },
    },
    "/api/public/tour-quote": {
      post: {
        tags: ["Public"],
        summary: "Cotizar tour (adultos, niños, promociones)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/TourQuoteRequest" } },
          },
        },
        responses: {
          "200": { description: "Subtotal, descuentos y total" },
          "404": { description: "Tour no encontrado" },
        },
      },
    },
    "/api/public/reviews": {
      post: {
        tags: ["Public"],
        summary: "Enviar reseña (token del enlace WhatsApp)",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ReviewSubmit" } },
          },
        },
        responses: {
          "200": { description: "Reseña guardada" },
          "400": { description: "Validación o enlace inválido" },
        },
      },
    },
    "/api/public/reviews/invite": {
      get: {
        tags: ["Public"],
        summary: "Datos del enlace de reseña",
        parameters: [
          { name: "token", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Tour, reserva y estado del enlace" },
          "404": { description: "Token no válido" },
        },
      },
    },
    "/api/public/display-currency": {
      get: {
        tags: ["Public"],
        summary: "Moneda de visualización (COP/USD)",
        responses: { "200": { description: "Moneda detectada y tasa" } },
      },
      post: {
        tags: ["Public"],
        summary: "Fijar moneda del visitante (cookie)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { currency: { type: "string", enum: ["COP", "USD"] } },
              },
            },
          },
        },
        responses: { "200": { description: "Moneda guardada" } },
      },
    },
    "/api/admin/tours": {
      get: {
        tags: ["Admin — Tours"],
        summary: "Listar tours",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Lista de tours" }, "401": { description: "JWT inválido" } },
      },
      post: {
        tags: ["Admin — Tours"],
        summary: "Crear tour",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Tour creado" }, "401": { description: "No autorizado" } },
      },
    },
    "/api/admin/tours/{id}": {
      get: {
        tags: ["Admin — Tours"],
        summary: "Detalle de tour",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Tour" }, "404": { description: "No encontrado" } },
      },
      put: {
        tags: ["Admin — Tours"],
        summary: "Actualizar tour",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Actualizado" } },
      },
      delete: {
        tags: ["Admin — Tours"],
        summary: "Eliminar tour",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Eliminado" } },
      },
    },
    "/api/admin/bookings": {
      get: {
        tags: ["Admin — Reservas"],
        summary: "Listar reservas",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Reservas" } },
      },
      post: {
        tags: ["Admin — Reservas"],
        summary: "Crear reserva",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Reserva creada" } },
      },
    },
    "/api/admin/bookings/{id}": {
      get: {
        tags: ["Admin — Reservas"],
        summary: "Detalle de reserva",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Reserva" } },
      },
      put: {
        tags: ["Admin — Reservas"],
        summary: "Actualizar reserva (confirmar dispara WhatsApp)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Actualizada" } },
      },
      delete: {
        tags: ["Admin — Reservas"],
        summary: "Eliminar reserva",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Eliminada" } },
      },
    },
    "/api/admin/bookings/{id}/send-review": {
      post: {
        tags: ["Admin — Reservas"],
        summary: "Enviar WhatsApp invitación a reseña",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Resultado del envío" } },
      },
    },
    "/api/admin/promotions": {
      get: {
        tags: ["Admin — Promociones"],
        summary: "Listar promociones",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Promociones" } },
      },
      post: {
        tags: ["Admin — Promociones"],
        summary: "Crear promoción",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Creada" } },
      },
    },
    "/api/admin/promotions/preview": {
      post: {
        tags: ["Admin — Promociones"],
        summary: "Vista previa de descuentos en una reserva",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Cálculo de promociones" } },
      },
    },
    "/api/admin/whatsapp-config": {
      get: {
        tags: ["Admin — Configuración"],
        summary: "Configuración WhatsApp y plantillas",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Configuración" } },
      },
      put: {
        tags: ["Admin — Configuración"],
        summary: "Guardar configuración WhatsApp",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Guardada" } },
      },
    },
    "/api/cron/post-experience-reviews": {
      get: {
        tags: ["Cron"],
        summary: "Enviar invitaciones a reseña pendientes",
        security: [{ cronSecret: [] }],
        responses: { "200": { description: "Resumen de envíos" }, "401": { description: "Secreto inválido" } },
      },
    },
  },
};
