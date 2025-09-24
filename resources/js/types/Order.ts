import { Cart } from "./Cart";

export type Order = {
  id: number;
  user_id: number;
  cart: Cart;
  shipping_status: string;
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  tracking_history?: any;
  label_url?: string | null;
  shipment_id?: string | null;
  legal_agreement: boolean;
  is_completed: boolean;
  returnable: boolean;
  return_status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
};