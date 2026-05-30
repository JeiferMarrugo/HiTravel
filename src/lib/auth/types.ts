export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  lastActivity: number;
};
