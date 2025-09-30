import { Address } from "./Shipping";
import { Image } from "./Image";
import { Cart } from "./Cart/Cart";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  role: 'user' | 'admin' | 'guest';
  avatar?: Image | null;
  addresses?: Address[];
  carts?: Cart[];
  is_admin: boolean;
  isGuest: boolean;
}