export interface User {
  id: number;
  name: string;   // required name (you can change to `string | null` if nullable)
  email: string;
  avatar: string;
  role: string;
  isAdmin: boolean;       // admin flag
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
  images: string[];           // always an array
  image_sources?: string[] | null;
  description?: string | null;
  isPsyilocybinSpores: boolean;
  options?: Record<string, any> | null;
  reviews?: Review[];
  average_rating?: number;    // average rating of item
  created_at: string;         // created date string
}

export interface Review {
  id: number;
  user: User;
  content: string;
  rating: number;
  likes: number;
  dislikes: number;
  liked: boolean;
  disliked: boolean;
  created_at: string;
  updated_at: string;
  images: { id: number; url: string }[];
  parent_id?: number | null;
  replies?: Reply[];          // polymorphic replies to review
}

export interface Reply {
  id: number;
  user: User;
  content: string | null;
  likes: number;
  dislikes: number;
  created_at: string;
  updated_at: string;
  replies?: Reply[];          // nested replies
}
