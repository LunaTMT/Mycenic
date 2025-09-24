import { Review } from "./Review";
import { Image } from "./Image";

export interface Item {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  weight: number;
  isPsyilocybinSpores: boolean;
  options: Record<string, any> | null;
  images: Image[];
  reviews?: Review[];
  average_rating?: number;
  reviews_count?: number;
  thumbnail?: string;
  stripe_product_id?: string | null;
  stripe_price_id?: string | null;
  created_at: string;
  updated_at: string;
}
