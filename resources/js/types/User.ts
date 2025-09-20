import { ShippingDetail } from "./Shipping";
import { Image } from "./Image";

// Base fields common to all users
interface BaseUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_admin: boolean;
  phone?: string | null;
  provider?: string | null;
  provider_id?: string | null;
  shippingDetails?: ShippingDetail[];
  avatar?: Image | null;
  created_at?: string;
  updated_at?: string;
  isGuest?: boolean; // make optional
}

// Logged-in user type
export interface AuthenticatedUser extends BaseUser {
  isGuest: false; // can still narrow type
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
