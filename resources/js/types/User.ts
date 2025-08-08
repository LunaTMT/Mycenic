import { ShippingDetail } from "./Shipping";

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  is_admin: boolean;
  phone?: string | null;
  provider?: string | null;
  provider_id?: string | null;
  shippingDetails?: ShippingDetail[];
}

// User or Guest union type
export type UserOrGuest = 
  | (User & { isGuest: false })
  | { isGuest: true; id: 0; name: string; email: string; avatar: string; role: "guest"; is_admin: false; phone: null; provider: null; provider_id: null; shippingDetails: ShippingDetail[] };
