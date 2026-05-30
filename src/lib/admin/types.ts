export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  match?: "exact" | "startsWith";
};

export type DashboardStat = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "warning" | "danger";
  icon: string;
  change?: string;
};

export type SalesDataPoint = {
  month: string;
  sales: number;
  bookings: number;
};

export type TourRevenueMetric = {
  tour: string;
  revenue: number;
  bookings: number;
};

export type BookingChannelMetric = {
  name: string;
  value: number;
  color: string;
};

export type TopClientMetric = {
  id: string;
  name: string;
  email: string;
  bookings: number;
  totalSpent: number;
  lastBooking: string;
};

export type RecentSaleRow = {
  id: string;
  customer: string;
  tour: string;
  date: string;
  amount: number;
  paymentStatus: "paid" | "pending" | "refunded";
  approvalStatus: "confirmed" | "pending" | "cancelled";
};

export type Departure = {
  id: string;
  title: string;
  image: string;
  time: string;
  meetingPoint: string;
  passengers: string;
  statusLabel: string;
};

export type PendingItem = {
  id: string;
  customer: string;
  product: string;
  amount: string;
  note?: string;
  urgency?: string;
};

export type Booking = {
  id: string;
  customer: string;
  customerCode: string;
  customerTone: "blue" | "yellow" | "dark" | "olive";
  tourName: string;
  tag?: string;
  date: string;
  amount: string;
  paymentStatus: "paid" | "pending" | "refunded";
  approvalStatus: "confirmed" | "pending" | "cancelled";
};

export type AdminTourCard = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  capacity: string;
  location: string;
  rating: string;
  image: string;
  active: boolean;
};

export type RateSeason = {
  id: string;
  season: string;
  adultPrice: string;
  childPrice: string;
};

export type ItineraryStep = {
  id: string;
  time: string;
  title: string;
  description: string;
};

export type AdminTourDetail = {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  media: { id: string; label: string; image: string }[];
  pricing: RateSeason[];
  itinerary: ItineraryStep[];
  included: string[];
};

export type SettingsSection = {
  id: string;
  title: string;
  description: string;
  fields: {
    label: string;
    value: string;
    type?: "text" | "email" | "tel";
  }[];
};

export type OpenWaSessionStatus =
  | "created"
  | "initializing"
  | "qr_ready"
  | "authenticating"
  | "ready"
  | "disconnected"
  | "failed";

export type OpenWaSession = {
  id: string;
  name: string;
  status: OpenWaSessionStatus;
  phone?: string | null;
  pushName?: string | null;
  connectedAt?: string | null;
  lastActive?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OpenWaQrCode = {
  qrCode: string;
  status: OpenWaSessionStatus;
};

export type OpenWaMessageDirection = "incoming" | "outgoing";
export type OpenWaMessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export type OpenWaMessage = {
  id: string;
  sessionId: string;
  waMessageId?: string | null;
  chatId: string;
  from: string;
  to: string;
  body?: string | null;
  type: string;
  direction: OpenWaMessageDirection;
  timestamp?: number | null;
  metadata?: Record<string, unknown> | null;
  status: OpenWaMessageStatus;
  createdAt: string;
};

export type OpenWaMessagesResponse = {
  messages: OpenWaMessage[];
  total: number;
};

export type OpenWaChatKind = "contact" | "group" | "unknown";

export type OpenWaChat = {
  id: string;
  name: string;
  kind: OpenWaChatKind;
  lastMessage?: string;
  lastTimestamp?: number | null;
  messageCount: number;
};

export type OpenWaParticipant = {
  id?: string;
  number?: string;
  name?: string;
  pushname?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
};

export type OpenWaGroup = {
  id: string;
  name?: string;
  subject?: string;
  description?: string;
  participants?: OpenWaParticipant[];
  inviteCode?: string;
  inviteLink?: string;
};

export type OpenWaContact = {
  id: string;
  name?: string;
  number?: string;
  pushname?: string;
  shortName?: string;
  isBusiness?: boolean;
  isBlocked?: boolean;
  profilePictureUrl?: string | null;
};

export type OpenWaWebhook = {
  id: string;
  sessionId: string;
  url: string;
  events: string[];
  secret?: string | null;
  headers: Record<string, string>;
  active: boolean;
  retryCount: number;
  lastTriggeredAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OpenWaOverviewStats = {
  sessions: {
    active: number;
    total: number;
    byStatus: Record<string, number>;
  };
  messages: {
    sent: number;
    received: number;
    failed: number;
    today: {
      sent: number;
      received: number;
    };
  };
};

export type OpenWaMessageStats = {
  timeSeries: Array<{
    timestamp: string;
    sent: number;
    received: number;
  }>;
  byType: Record<string, number>;
  bySession: Array<{
    sessionId: string;
    name: string;
    sent: number;
    received: number;
  }>;
  topChats: Array<{
    chatId: string;
    messageCount: number;
  }>;
};

export type OpenWaSessionStats = {
  session: {
    id: string;
    name: string;
    status: string;
  };
  messages: {
    sent: number;
    received: number;
    today: number;
    failed: number;
  };
  topChats: Array<{
    chatId: string;
    count: number;
    lastActive: string;
  }>;
  hourlyActivity: Array<{
    hour: number;
    sent: number;
    received: number;
  }>;
};
