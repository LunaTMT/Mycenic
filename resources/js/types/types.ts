export interface Item {
  id: number;
  name: string;
  price: number;       // <-- number type here is perfect
  stock: number;
  category: string;
  images: string[];
  image_sources?: string[] | null;
  description?: string | null;
  isPsyilocybinSpores: boolean;
  options?: Record<string, any> | null;
  reviews?: Review[];
  average_rating?: number;
  created_at: string;
}


export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isAdmin: boolean;
  phone?: string | null;
  provider?: string | null;
  provider_id?: string | null;
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
  replies: Review[];  
}
