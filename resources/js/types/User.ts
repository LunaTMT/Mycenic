import { ShippingDetail } from "./Shipping";
import { Image } from "./Image";

// Base fields common to all users
interface BaseUser {
  id: number;
  name?: string | null;
  email: string;
  role: string;
  is_admin: boolean;
  phone?: string | null;

  // OAuth
  provider?: string | null;
  provider_id?: string | null;

  // Stripe billing
  stripe_id?: string | null;
  pm_type?: string | null;
  pm_last_four?: string | null;
  trial_ends_at?: string | null; // ISO string

  // Relations
  shippingDetails?: ShippingDetail[];
  avatar?: Image | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;

  // Helper
  isGuest?: boolean;
}

// Logged-in user type
export interface AuthenticatedUser extends BaseUser {
  isGuest: false;
  is_admin: boolean;
  avatar: Image;
}

// Guest user type
export interface GuestUser extends BaseUser {
  isGuest: true;
  id: 0;
  role: "guest";
  is_admin: false;
  phone: null;
  provider: null;
  provider_id: null;
  shippingDetails: ShippingDetail[];
  avatar?: null;
  created_at?: undefined;
  updated_at?: undefined;
}

// Union type
export type UserOrGuest = AuthenticatedUser | GuestUser;

// Export alias
export type User = UserOrGuest;
