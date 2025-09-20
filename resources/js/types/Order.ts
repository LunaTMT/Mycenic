import { CartItem } from "./CartItem";
import { ShippingDetails } from "./ShippingDetails";
import { TrackingInfo } from "./TrackingInfo";

export type Order = {
  id: number;
  user_id: number;
  total: number;
  subtotal: number;
  shipping_cost: number;
  weight: number;
  discount: number;

  payment_status: string;
  shipping_status: string;
  return_status: string;

  is_completed: boolean;
  returnable: boolean;
  legal_agreement: boolean;

  cart: CartItem[];
  returnable_cart: CartItem[];
  shipping_details: ShippingDetails | null;
  tracking?: TrackingInfo;

  created_at: string;
  updated_at: string;
};
