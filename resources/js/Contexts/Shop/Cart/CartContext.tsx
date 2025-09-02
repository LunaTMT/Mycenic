import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Cart, CartItem } from "@/types/Cart";
import { v4 as uuidv4 } from "uuid";

interface CartContextType {
  cart: Cart;
  setCart: React.Dispatch<React.SetStateAction<Cart>>;
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  setShippingCost: (cost: number) => void;
  setDiscount: (discount: number) => void;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      if (stored) return JSON.parse(stored);
    }
    return { id: 0, items: [], subtotal: 0, total: 0, discount: 0, shipping_cost: 0 };
  });

  const [cartOpen, setCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const subtotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.item.price * item.quantity, 0),
    [cart.items]
  );

  const shippingCost = useMemo(() => cart.shipping_cost || 0, [cart.shipping_cost]);
  const discount = useMemo(() => cart.discount || 0, [cart.discount]);

  // Total without tax
  const total = useMemo(() => Math.max(subtotal + shippingCost - discount, 0), [
    subtotal,
    shippingCost,
    discount,
  ]);

  const addToCart = (item: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const existingIndex = prev.items.findIndex(
        (cartItem) =>
          cartItem.item.id === item.item.id &&
          JSON.stringify(cartItem.selectedOptions) === JSON.stringify(item.selectedOptions)
      );

      let updatedItems;

      if (existingIndex > -1) {
        updatedItems = [...prev.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + item.quantity,
        };
      } else {
        updatedItems = [...prev.items, { ...item, id: uuidv4() }];
      }

      return { ...prev, items: updatedItems, updated_at: new Date().toISOString() };
    });

    setCartOpen(true);
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => item.id !== cartItemId);
      return { ...prev, items: updatedItems, updated_at: new Date().toISOString() };
    });
  };

  const clearCart = () => {
    setCart((prev) => ({
      ...prev,
      items: [],
      discount: 0,
      updated_at: new Date().toISOString(),
    }));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((prev) => {
      const updatedItems = prev.items.map((i) =>
        i.id === cartItemId ? { ...i, quantity: newQuantity } : i
      );
      return { ...prev, items: updatedItems, updated_at: new Date().toISOString() };
    });
  };

  const setShippingCost = (cost: number) => {
    setCart((prev) => ({
      ...prev,
      shipping_cost: cost,
      updated_at: new Date().toISOString(),
    }));
  };

  const setDiscount = (discount: number) => {
    setCart((prev) => ({
      ...prev,
      discount,
      updated_at: new Date().toISOString(),
    }));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeItem,
        clearCart,
        updateQuantity,
        setShippingCost,
        setDiscount,
        cartOpen,
        setCartOpen,
        subtotal,
        shippingCost,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
