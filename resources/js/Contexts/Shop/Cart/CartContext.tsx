import React, { createContext, useContext, useState, useEffect } from "react";
import { Cart, CartItem } from "@/types/Cart";

interface CartContextType {
  cart: Cart;
  setCart: React.Dispatch<React.SetStateAction<Cart>>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  totalWeight: number;
  cartOpen: boolean;
  setCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [cart, setCart] = useState<Cart>({ cart_items: [] } as Cart);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  // Fetch cart from backend at /cart/data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/cart/data", {
          headers: {
            Accept: "application/json",
          },
          credentials: "include",  // send cookies for auth if needed
        });
        if (!response.ok) throw new Error("Failed to fetch cart data");
        const data = await response.json();
        setCart(data);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    fetchCart();
  }, []);

  // Calculate total weight
  useEffect(() => {
    if (!cart.cart_items?.length) {
      setTotalWeight(0);
      return;
    }

    const weight = cart.cart_items.reduce((sum, item) => {
      const w = parseFloat(item.weight as any) || 0;
      const q = item.quantity || 0;
      return sum + w * q;
    }, 0);

    setTotalWeight(weight);
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => ({
      ...prevCart,
      cart_items: [...(prevCart.cart_items ?? []), item],
      updated_at: new Date().toISOString(),
    }));
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => ({
      ...prevCart,
      cart_items: (prevCart.cart_items ?? []).filter((item) => item.id !== id),
      updated_at: new Date().toISOString(),
    }));
  };

  const clearCart = () => {
    setCart((prevCart) => ({
      ...prevCart,
      cart_items: [],
      updated_at: new Date().toISOString(),
    }));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        clearCart,
        totalWeight,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
