import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { Cart, CartItem } from "@/types/Cart";
import { useUser } from "@/Contexts/UserContext";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

interface CartContextType {
  cart: Cart;
  addToCart: (cartItem: CartItem) => void;
  removeItem: (cartItem: CartItem) => void;
  clearCart: () => void;
  updateQuantity: (cartItem: CartItem, quantity: number) => void;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  subtotal: number;
  total: number;
  totalWeight: number; // <-- Add totalWeight here
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useUser();

  const [cart, setCart] = useState<Cart>(() => {
    if (typeof window === "undefined") return emptyCart();
    if (!user || user.isGuest) {
      const stored = localStorage.getItem("cart");
      const parsed = stored ? JSON.parse(stored) : emptyCart();
      parsed.items?.forEach((i: any) => { if (!i.tempId) i.tempId = uuidv4(); });
      return parsed;
    }
    return emptyCart();
  });

  const [cartOpen, setCartOpen] = useState(false);

  // ---------- Total Weight Calculation ----------
  const totalWeight = useMemo(() => {
    return cart.items?.reduce((sum, item) => sum + (item.item.weight || 0) * item.quantity, 0) || 0;
  }, [cart.items]);

  // ---------- Cart Operations ----------
  const addToCart = (cartItem: CartItem) => {
    updateCartItems(items => {
      const existing = items.find(i => isSameItem(i, cartItem));
      if (existing) {
        existing.quantity += cartItem.quantity;
      } else {
        const newItem = { ...cartItem, tempId: uuidv4() };
        items.push(newItem);
      }
      return items;
    });
    setCartOpen(true);
  };

  const updateQuantity = (cartItem: CartItem, quantity: number) => {
    if (quantity < 1) return;
    updateCartItems(items => {
      const existing = items.find(i => isSameItem(i, cartItem));
      if (existing) {
        existing.quantity = quantity;
      }
      return items;
    });
  };

  const removeItem = (cartItem: CartItem) => {
    updateCartItems(items => {
      const updated = items.filter(i => !isSameItem(i, cartItem));
      return updated;
    });
  };

  const clearCart = () => {
    updateCartItems(() => []);
  };

  // ---------- Helpers ----------
  const isSameItem = (a: CartItem, b: CartItem) => {
    if (!a.item || !b.item) return false;
    return (
      a.item.id === b.item.id &&
      JSON.stringify(a.selected_options || {}) === JSON.stringify(b.selected_options || {})
    );
  };

  const updateCartItems = (callback: (items: CartItem[]) => CartItem[]) => {
    setCart(prev => {
      const updatedItems = callback(prev.items || []);
      return { ...prev, items: updatedItems, updated_at: new Date().toISOString() };
    });
  };

  // ---------- Calculations ----------
  const subtotal = useMemo(() => cart.items?.reduce((sum, i) => sum + (i.item.price || 0) * i.quantity, 0) || 0, [cart.items]);
  const total = useMemo(() => subtotal, [subtotal]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeItem,
        clearCart,
        updateQuantity,
        cartOpen,
        setCartOpen,
        subtotal,
        total,
        totalWeight, // Provide total weight
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Utility function to initialize an empty cart
function emptyCart(): Cart {
  const now = new Date().toISOString();
  return {
    id: 0,
    items: [],
    subtotal: 0,
    total: 0,
    discount: 0,
    shipping_cost: 0,
    status: "active",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
}
