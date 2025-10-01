import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "./CartContext";
import { Promotion } from "@/types/Cart/Promotion";

interface PromotionContextType {
  promotion: Promotion | null;
  applyPromotion: (code: string) => Promise<boolean>;
  clearPromotion: () => void;
}

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) throw new Error("usePromotion must be used within PromotionProvider");
  return context;
};

export const PromotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart } = useCart();
  const [promotion, setPromotion] = useState<Promotion | null>(null);

  // Load promotion from cart or localStorage on mount
  useEffect(() => {
    if (cart?.promotion) {
      setPromotion(cart.promotion);
    } else {
      const saved = localStorage.getItem("promotion");
      if (saved) {
        try {
          setPromotion(JSON.parse(saved));
        } catch {
          localStorage.removeItem("promotion");
        }
      }
    }
  }, [cart]);

  const applyPromotion = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    try {
      const { data } = await axios.post("/promotion/validate", { code: code.trim() });
      if (data.success) {
        setPromotion(data.promotion);
        localStorage.setItem("promotion", JSON.stringify(data.promotion));
        return true;
      }
      clearPromotion();
      return false;
    } catch {
      clearPromotion();
      return false;
    }
  };

  const clearPromotion = () => {
    setPromotion(null);
    localStorage.removeItem("promotion");
  };

  return (
    <PromotionContext.Provider value={{ promotion, applyPromotion, clearPromotion }}>
      {children}
    </PromotionContext.Provider>
  );
};
