import { Review } from "./Review";
import { Image } from "./Image";
import { Timestamps } from "./Timestamps";

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
  timestamps: Timestamps;
}
