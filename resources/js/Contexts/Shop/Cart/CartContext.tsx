import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
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
  totalWeight: number;
  fetchCart: () => void;
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
  const [cart, setCart] = useState<Cart>(emptyCart());
  const [cartOpen, setCartOpen] = useState(false);

  // ---------- Fetch Cart ----------
  const fetchCart = () => {
    if (!user || user.isGuest) {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.items?.forEach((i: any) => { if (!i.tempId) i.tempId = uuidv4(); });
        setCart(parsed);
      } else {
        setCart(emptyCart());
      }
    } else {
      axios.get("/cart/show", { params: { user_id: user.id } })
        .then(res => setCart(res.data.cart || emptyCart()))
        .catch(err => console.error("Failed to fetch backend cart", err));
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // ---------- Normalize options ----------
  const normalizeOptions = (options: Record<string, any> | undefined): Record<string, any> => {
    if (!options) return {};
    const sortedKeys = Object.keys(options).sort();
    const normalized: Record<string, any> = {};
    for (const key of sortedKeys) {
      const value = options[key];
      if (Array.isArray(value)) normalized[key] = [...value].sort();
      else if (value && typeof value === "object") normalized[key] = normalizeOptions(value);
      else normalized[key] = value;
    }
    return normalized;
  };

  // ---------- Helpers ----------
  const isSameItem = (a: CartItem, b: CartItem) => {
    if (!a.item || !b.item) {
      // fallback for items without real item id
      return a.tempId && b.tempId ? a.tempId === b.tempId : false;
    }

    if (a.item.id !== b.item.id) return false;

    const aOptions = normalizeOptions(a.selected_options ?? {});
    const bOptions = normalizeOptions(b.selected_options ?? {});

    return JSON.stringify(aOptions) === JSON.stringify(bOptions);
  };

  const updateCartItems = (callback: (items: CartItem[]) => CartItem[]) => {
    setCart(prev => {
      const updatedItems = callback(prev.items || []);
      const updatedCart = { ...prev, items: updatedItems, updated_at: new Date().toISOString() };
      if (!user || user.isGuest) localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // ---------- Cart Operations ----------
  const addToCart = (cartItem: CartItem) => {
    if (!user || user.isGuest) {
      updateCartItems(items => {
        const existing = items.find(i => isSameItem(i, cartItem));
        if (existing) {
          existing.quantity += cartItem.quantity;
        } else {
          items.push({ ...cartItem, tempId: uuidv4() });
        }
        return items;
      });
    } else {
      axios.post("/cart/items", {
        user_id: user.id,
        item_id: cartItem.item.id,
        quantity: cartItem.quantity,
        selected_options: cartItem.selected_options || {},
      })
      .then(res => setCart(res.data.cart || emptyCart()))
      .catch(err => console.error("Failed to add item to backend cart", err));
    }
    setCartOpen(true);
  };

  const updateQuantity = (cartItem: CartItem, quantity: number) => {
    if (!user || user.isGuest) {
      updateCartItems(items => {
        const existing = items.find(i => isSameItem(i, cartItem));
        if (existing) existing.quantity = quantity;
        return items;
      });
    } else {
      axios.put(`/cart/items/${cartItem.item.id}`, {
        user_id: user.id,
        quantity,
        selected_options: cartItem.selected_options || {},
      })
      .then(res => setCart(res.data.cart || emptyCart()))
      .catch(err => console.error("Failed to update backend cart item", err));
    }
  };

  const removeItem = (cartItem: CartItem) => {
    if (!user || user.isGuest) {
      updateCartItems(items => items.filter(i => !isSameItem(i, cartItem)));
    } else {
      axios.delete(`/cart/items/${cartItem.item.id}`, {
        data: {
          user_id: user.id,
          selected_options: cartItem.selected_options || {},
        }
      })
      .then(res => setCart(res.data.cart || emptyCart()))
      .catch(err => console.error("Failed to remove backend cart item", err));
    }
  };

  const clearCart = () => {
    if (!user || user.isGuest) {
      setCart(emptyCart());
      localStorage.removeItem("cart");
    } else {
      axios.delete("/cart", { data: { user_id: user.id } })
        .then(() => setCart(emptyCart()))
        .catch(err => console.error("Failed to clear backend cart", err));
    }
  };

  // ---------- Calculations ----------
  const subtotal = useMemo(() => cart.items?.reduce((acc, i) => acc + (i.item.price || 0) * i.quantity, 0) || 0, [cart.items]);
  const total = useMemo(() => subtotal, [subtotal]);
  const totalWeight = useMemo(() => cart.items?.reduce((sum, i) => sum + (i.item.weight || 0) * i.quantity, 0) || 0, [cart.items]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeItem,
      clearCart,
      updateQuantity,
      cartOpen,
      setCartOpen,
      subtotal,
      total,
      totalWeight,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// ---------- Utility ----------
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
