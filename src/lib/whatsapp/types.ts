export type WhatsAppTemplateKey =
  | "booking_confirmed"
  | "checkin_reminder"
  | "post_experience_review";

export type WhatsAppSettings = {
  activeSessionId: string | null;
  sendOnBookingConfirmed: boolean;
  sendBeforeCheckin: boolean;
  hoursBeforeCheckin: number;
  sendAfterExperience: boolean;
  hoursAfterCheckin: number;
  maxSendAttempts: number;
  defaultCountryCode: string;
  updatedAt: string;
};

export type WhatsAppMessageTemplate = {
  templateKey: WhatsAppTemplateKey;
  name: string;
  description: string | null;
  body: string;
  isEnabled: boolean;
  updatedAt: string;
};

export type WhatsAppConfigPayload = {
  settings: WhatsAppSettings;
  templates: WhatsAppMessageTemplate[];
  placeholders: string[];
};

export type UpdateWhatsAppConfigInput = {
  settings?: {
    activeSessionId?: string | null;
    sendOnBookingConfirmed?: boolean;
    sendBeforeCheckin?: boolean;
    hoursBeforeCheckin?: number;
    sendAfterExperience?: boolean;
    hoursAfterCheckin?: number;
    maxSendAttempts?: number;
    defaultCountryCode?: string;
  };
  templates?: Array<{
    templateKey: WhatsAppTemplateKey;
    body?: string;
    isEnabled?: boolean;
  }>;
};

export const TEMPLATE_PLACEHOLDERS = [
  "{{customer_name}}",
  "{{booking_code}}",
  "{{tour_name}}",
  "{{checkin_date}}",
  "{{checkin_time}}",
  "{{amount}}",
  "{{review_link}}",
] as const;
