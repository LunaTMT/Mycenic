export interface ShippingRate {
  id: string;
  provider: string;
  service: string;
  amount: string;
}

export interface ShippingDetail {
  id: number;
  user_id?: number | null;
  country: string;
  full_name: string;
  phone?: string | null;         
  zip: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state?: string | null;
  is_default?: boolean;
  delivery_instructions?: string | null;
  created_at: string;  
  updated_at: string;  
}
