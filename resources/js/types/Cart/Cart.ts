import { Item } from "../Item";
import { Promotion } from "./Promotion";
import { Timestamps } from "../Timestamps";

export type CartStatus = "active" | "checked_out";



// Numeric amounts for cart totals
export interface Amounts {
  subtotal: number;
  total: number;
  shipping_cost: number;
  weight: number;
  discount?: number;
}

export interface CartItem {
  id: number;
  tempId?: string;
  cart_id: number;
  item_id: number;
  quantity: number;
  selected_options?: Record<string, any> | null;
  timestamps: Timestamps;
  item: Item;
}

export interface Cart {
  id: number;
  status: CartStatus;
  promotion?: Promotion | null;

  timestamps: Timestamps;
  amounts: Amounts;

  items: CartItem[];
}
