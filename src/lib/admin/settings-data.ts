import type { SettingsSection } from "@/lib/admin/types";

export const settingsSections: SettingsSection[] = [
  {
    id: "general",
    title: "Información general",
    description: "Define la información base que verán los viajeros y operadores en el panel interno.",
    fields: [
      { label: "Nombre comercial", value: "HI TRAVEL" },
      { label: "Correo operativo", value: "ops@hitravel.com", type: "email" },
      { label: "Teléfono principal", value: "+57 300 123 4567", type: "tel" },
    ],
  },
  {
    id: "notifications",
    title: "Notificaciones",
    description: "Configura cómo y cuándo el equipo recibe alertas sobre reservas, pagos y salidas.",
    fields: [
      { label: "Canal principal", value: "WhatsApp + Correo" },
      { label: "Alerta de pago pendiente", value: "30 minutos antes del corte" },
      { label: "Recordatorio de salida", value: "12 horas antes" },
    ],
  },
  {
    id: "billing",
    title: "Facturación y cobros",
    description: "Mantén visibles los datos de referencia para validaciones y conciliaciones manuales.",
    fields: [
      { label: "Método principal", value: "Transferencia / pasarela" },
      { label: "Moneda base", value: "USD / COP" },
      { label: "Anticipo requerido", value: "30%" },
    ],
  },
];
