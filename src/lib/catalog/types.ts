export type PackageType = "pasadia" | "paquete" | "tour" | "experiencia";

export type PaymentStatus = "paid" | "pending" | "partial" | "refunded";

export type PaymentMethod =
  | "transferencia"
  | "consignacion"
  | "efectivo"
  | "nequi"
  | "daviplata"
  | "tarjeta"
  | "paypal"
  | "otro";

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "consignacion", label: "Consignación / depósito" },
  { value: "efectivo", label: "Efectivo" },
  { value: "nequi", label: "Nequi" },
  { value: "daviplata", label: "Daviplata" },
  { value: "tarjeta", label: "Tarjeta débito / crédito" },
  { value: "paypal", label: "PayPal" },
  { value: "otro", label: "Otro" },
];
export type ApprovalStatus = "confirmed" | "pending" | "cancelled";

import type { PromotionConfig, PromotionType } from "@/lib/catalog/promotion-types";

export type { PromotionType, PromotionConfig };

export type PromotionRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  promotionType: PromotionType;
  config: PromotionConfig;
  tourIds: string[] | null;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePromotionInput = {
  name: string;
  slug?: string;
  description?: string;
  promotionType: PromotionRecord["promotionType"];
  config: PromotionRecord["config"];
  tourIds?: string[] | null;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdatePromotionInput = Partial<CreatePromotionInput>;

export type AppliedPromotion = {
  promotionId: string;
  promotionName: string;
  discountCents: number;
};

export type TourCategory = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type PricingSeason = {
  id: string;
  season: string;
  adultPriceCents: number;
  childPriceCents: number;
};

export type ItineraryItem = {
  id: string;
  time: string;
  title: string;
  description: string;
  featured?: boolean;
};

export type TourRecord = {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  packageType: PackageType;
  badge: string | null;
  country: string;
  location: string;
  shortDescription: string;
  description: string;
  longDescription: string[];
  priceFromCents: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  durationLabel: string;
  groupSizeLabel: string;
  languages: string;
  heroImageUrl: string | null;
  gallery: string[];
  includes: string[];
  excludes: string[];
  highlights: string[];
  meetingPoint: string | null;
  cancellationPolicy: string | null;
  pricingSeasons: PricingSeason[];
  itinerary: ItineraryItem[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type TourListItem = {
  id: string;
  slug: string;
  name: string;
  categoryName: string | null;
  packageType: PackageType;
  shortDescription: string;
  priceFromCents: number;
  currency: string;
  durationLabel: string;
  groupSizeLabel: string;
  location: string;
  rating: number;
  heroImageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
};

export type BookingGuestRecord = {
  id: string;
  bookingId: string;
  fullName: string;
  idTypeId: string | null;
  idTypeName: string | null;
  idNumber: string | null;
  isChild: boolean;
  sortOrder: number;
  createdAt: string;
};

export type BookingRecord = {
  id: string;
  bookingCode: string;
  tourId: string | null;
  tourName: string;
  customerName: string;
  customerPhone: string;
  customerPhoneE164: string | null;
  customerEmail: string | null;
  customerCity: string | null;
  customerIdTypeId: string | null;
  customerIdTypeName: string | null;
  customerIdNumber: string | null;
  bookingSource: string;
  checkinAt: string;
  amountCents: number | null;
  currency: string;
  adults: number;
  children: number;
  paymentStatus: PaymentStatus;
  approvalStatus: ApprovalStatus;
  notes: string | null;
  paidCents: number;
  balanceCents: number | null;
  promotionId: string | null;
  promotionName: string | null;
  promotionIds: string[];
  appliedPromotions: AppliedPromotion[];
  subtotalCents: number | null;
  discountCents: number;
  experienceCompletedAt: string | null;
  customerAttendedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingWithGuests = {
  booking: BookingRecord;
  guests: BookingGuestRecord[];
};

export type BookingPaymentRecord = {
  id: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  voucherUrl: string | null;
  notes: string | null;
  paidAt: string;
  createdAt: string;
};

export type BookingWithPayments = {
  booking: BookingRecord;
  payments: BookingPaymentRecord[];
};

export type CreateBookingPaymentInput = {
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  voucherUrl?: string;
  notes?: string;
  paidAt?: string;
};

export type CreateTourInput = Omit<
  TourRecord,
  "id" | "slug" | "categoryName" | "createdAt" | "updatedAt"
> & { slug?: string };

export type UpdateTourInput = Partial<CreateTourInput> & { categoryName?: string };

export type CreateBookingInput = {
  tourId: string;
  customerName: string;
  customerPhone: string;
  customerPhoneE164?: string;
  customerEmail?: string;
  customerCity?: string;
  customerIdTypeId?: string;
  customerIdNumber?: string;
  bookingSource?: string;
  checkinAt: string;
  amountCents?: number;
  currency?: string;
  adults?: number;
  children?: number;
  paymentStatus?: PaymentStatus;
  approvalStatus?: ApprovalStatus;
  notes?: string;
  promotionId?: string | null;
  promotionIds?: string[];
  subtotalCents?: number | null;
  discountCents?: number;
};

export type UpdateBookingInput = Partial<CreateBookingInput> & {
  paymentStatus?: PaymentStatus;
  approvalStatus?: ApprovalStatus;
  customerAttendedAt?: string | null;
};
