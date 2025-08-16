import { ShippingDetail } from "./Shipping";
import { Image } from "./Image";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_admin: boolean; // if your API provides this, otherwise you can remove or compute on frontend
  phone?: string | null;
  provider?: string | null;
  provider_id?: string | null;
  shippingDetails?: ShippingDetail[];

  avatar: Image;        


  created_at?: string;
  updated_at?: string;
}

// Union type for User or Guest user:
export type UserOrGuest =
  | (User & { isGuest: false })
  | {
      isGuest: true;
      id: 0;
      name: string;
      email: string;
      role: "guest";
      is_admin: false;
      phone: null;
      provider: null;
      provider_id: null;
      shippingDetails: ShippingDetail[];
      avatar?: null;
      created_at?: undefined;
      updated_at?: undefined;
    };


    