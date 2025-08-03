import { Item } from "./Item";

export type CartItem = {
  id: number;
  item: Item;
  quantity: number;
  price: number;
  options?: Record<string, any>;
};
