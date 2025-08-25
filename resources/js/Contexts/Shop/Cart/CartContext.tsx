import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Cart, CartItem } from "@/types/Cart";

interface CartContextType {
  cart: Cart;
  setCart: React.Dispatch<React.SetStateAction<Cart>>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  updateQuantity: (
    id: number,
    selectedOptions: Record<string, string> | undefined,
    newQuantity: number
  ) => void;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  subtotal: number;
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
    // ✅ Load from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      if (stored) return JSON.parse(stored);
    }
    return { id: 0, items: [], subtotal: 0, total: 0 };
  });

  const [cartOpen, setCartOpen] = useState<boolean>(false);

  // ✅ Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Automatically compute subtotal & total when items change
  const subtotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.item.price * item.quantity, 0),
    [cart.items]
  );

  const total = useMemo(() => subtotal, [subtotal]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.items.findIndex((cartItem) => {
        if (cartItem.id !== item.id) return false;
        return (
          JSON.stringify(cartItem.selectedOptions) ===
          JSON.stringify(item.selectedOptions)
        );
      });

      let updatedItems;
      if (existingIndex > -1) {
        updatedItems = [...prev.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + item.quantity,
        };
      } else {
        updatedItems = [...prev.items, item];
      }

      return {
        ...prev,
        items: updatedItems,
        updated_at: new Date().toISOString(),
      };
    });

    setCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
      updated_at: new Date().toISOString(),
    }));
  };

  const clearCart = () => {
    setCart((prev) => ({
      ...prev,
      items: [],
      updated_at: new Date().toISOString(),
    }));
  };

  const updateQuantity = (
    id: number,
    selectedOptions: Record<string, string> | undefined,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setCart((prev) => {
      const updatedItems = prev.items.map((cartItem) => {
        const isSameItem =
          cartItem.id === id &&
          JSON.stringify(cartItem.selectedOptions) === JSON.stringify(selectedOptions);

        if (isSameItem) {
          return {
            ...cartItem,
            quantity: newQuantity,
          };
        }
        return cartItem;
      });

      return {
        ...prev,
        items: updatedItems,
        updated_at: new Date().toISOString(),
      };
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        cartOpen,
        setCartOpen,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
