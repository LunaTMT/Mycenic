import { UserOrGuest } from "./User";

export type CartItem = {
  id: number;
  item: {
    id: number;
    name: string;
    price: number;
    weight: number;
    image: string; 
    isPsyilocybinSpores: boolean;

  };
  quantity: number;
  selectedOptions?: Record<string, string>;

};


export type Cart = {
  id: number;
  user?: UserOrGuest;       
  items: CartItem[];
  subtotal: number;
  total: number;
  discount?: number;
  shipping_cost?: number;
  created_at?: string;
  updated_at?: string;
};
