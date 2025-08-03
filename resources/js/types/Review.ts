import { User } from "./User";

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
