import { Address } from "./Shipping";
import { Image } from "./Image";

interface BaseUser {
  id: number;
  name?: string | null;
  email: string;
  role: string;
  is_admin: boolean;
  phone?: string | null;
  provider?: string | null;
  provider_id?: string | null;
  stripe_id?: string | null;
  pm_type?: string | null;
  pm_last_four?: string | null;
  trial_ends_at?: string | null;
  addresses?: Address[];
  avatar?: Image | null;
  created_at?: string;
  updated_at?: string;
  isGuest?: boolean;
}

export interface AuthenticatedUser extends BaseUser {
  isGuest: false;
  is_admin: boolean;
  avatar: Image;
}

export interface GuestUser extends BaseUser {
  isGuest: true;
  id: 0;
  role: "guest";
  is_admin: false;
  phone: null;
  provider: null;
  provider_id: null;
  addresses?: Address[];
  avatar?: null;
  created_at?: undefined;
  updated_at?: undefined;
}

export type UserOrGuest = AuthenticatedUser | GuestUser;

export type User = UserOrGuest;
