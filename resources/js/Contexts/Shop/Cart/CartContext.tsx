import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Cart, CartItem } from "@/types/Cart";
import { v4 as uuidv4 } from "uuid";

interface CartContextType {
  cart: Cart;
  setCart: React.Dispatch<React.SetStateAction<Cart>>;
  addToCart: (item: Omit<CartItem, "id">) => void; // id will be generated internally
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  setShippingCost: (cost: number) => void; // New method to set shipping cost
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  subtotal: number;
  shippingCost: number;
  tax: number;
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
    return { id: 0, items: [], subtotal: 0, shippingCost: 0, tax: 0, total: 0 };
  });

  const [cartOpen, setCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const subtotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.item.price * item.quantity, 0),
    [cart.items]
  );

  // Shipping cost can now be set dynamically
  const shippingCost = useMemo(() => cart.shippingCost, [cart.shippingCost]);

  // Tax as a percentage of the subtotal
  const tax = useMemo(() => subtotal * 0.1, [subtotal]);

  // Total includes subtotal, shipping cost, and tax
  const total = useMemo(() => subtotal + shippingCost + tax, [subtotal, shippingCost, tax]);

  const addToCart = (item: Omit<CartItem, "id">) => {
    setCart((prev) => {
      // Check if the same product + options already exist
      const existingIndex = prev.items.findIndex(
        (cartItem) =>
          cartItem.item.id === item.item.id &&
          JSON.stringify(cartItem.selectedOptions) === JSON.stringify(item.selectedOptions)
      );

      let updatedItems;

      if (existingIndex > -1) {
        // Increment quantity, keep the same UUID
        updatedItems = [...prev.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + item.quantity,
        };
      } else {
        // New item, assign UUID
        updatedItems = [...prev.items, { ...item, id: uuidv4() }];
      }

      return { ...prev, items: updatedItems, updated_at: new Date().toISOString() };
    });

    setCartOpen(true);
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => {
      // Remove the item from the cart based on cartItemId
      const updatedItems = prev.items.filter((item) => item.id !== cartItemId);

      return { ...prev, items: updatedItems, updated_at: new Date().toISOString() };
    });
  };

  const clearCart = () => {
    setCart((prev) => ({ ...prev, items: [], updated_at: new Date().toISOString() }));
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

  // Function to dynamically set the shipping cost
  const setShippingCost = (cost: number) => {
    setCart((prev) => ({
      ...prev,
      shippingCost: cost,
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
        setShippingCost, // Expose setShippingCost
        cartOpen,
        setCartOpen,
        subtotal,
        shippingCost,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
