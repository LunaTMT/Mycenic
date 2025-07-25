// src/types.ts

export interface User {
  id: number;
  name?: string | null;
  email: string;
  avatar?: string | null;
  role: string;
  isAdmin: boolean;  // <-- add this
  phone?: string | null;
  provider?: string | null;
  provider_id?: string | null;
}


export interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  images: string[];  // always an array
  image_sources?: string[] | null;
  description?: string | null;
  isPsyilocybinSpores: boolean;
  options?: Record<string, any> | null;
  reviews?: Review[];
  average_rating?: number;  // add this line for average rating
  created_at: string;       // <-- add this line for created date
}


export interface Review {
  id?: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  content: string;
  rating: number;
  likes?: number;
  dislikes?: number;
  liked?: boolean;
  disliked?: boolean;
  created_at: string;
  updated_at: string;
  images: { id: number; url: string }[];
  parent_id?: number | null;
  children?: Review[];
}
