import { Review } from "./Review";

import { Image } from "./Image";

export interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  images: Image[]; 
  description: string;
  isPsyilocybinSpores: boolean;
  options: Record<string, any>;
  reviews?: Review[];
  average_rating?: number;
  created_at: string;
  weight: number;
}
