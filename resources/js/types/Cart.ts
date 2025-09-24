import { UserOrGuest } from "./User";
import { Item } from "./Item";

export type CartStatus = "active" | "checked_out";

export interface CartItem {
  id: number;
  tempId?: string;
  cart_id: number;
  item_id: number;
  quantity: number;
  selected_options?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  item: Item;
}

export interface Cart {
  id: number;
  user_id?: number | null;
  subtotal: number;
  total: number;
  discount?: number | null;
  shipping_cost?: number | null;
  status: CartStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  items: CartItem[];
  user?: UserOrGuest | null;
}
