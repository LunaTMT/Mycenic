import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "./CartContext";
import { PromoCode } from "@/types/Cart/PromoCode";

interface PromoContextType {
  promo: PromoCode | null;
  setPromo: React.Dispatch<React.SetStateAction<PromoCode | null>>;
  isPromoValid: boolean;
  applyPromoCode: (code?: string) => Promise<"success" | "error" | "same">;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export const usePromo = (): PromoContextType => {
  const context = useContext(PromoContext);
  if (!context) throw new Error("usePromo must be used within PromoProvider");
  return context;
};

interface PromoProviderProps {
  children: React.ReactNode;
}

export const PromoProvider: React.FC<PromoProviderProps> = ({ children }) => {
  const { cart } = useCart();
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [isPromoValid, setIsPromoValid] = useState<boolean>(false);
  const [lastAppliedCode, setLastAppliedCode] = useState<string>("");

  // Initialize from cart if promo exists, fallback to localStorage
  useEffect(() => {
    if (cart?.promo) {
      setPromo(cart.promo);
      setIsPromoValid(true);
      setLastAppliedCode(cart.promo.code);
    } else {
      const savedPromo = localStorage.getItem("promo");
      if (savedPromo) {
        try {
          const parsed: PromoCode = JSON.parse(savedPromo);
          setPromo(parsed);
          setIsPromoValid(true);
          setLastAppliedCode(parsed.code);
        } catch {
          localStorage.removeItem("promo");
        }
      }
    }
  }, [cart]);

  const applyPromoCode = async (code?: string): Promise<"success" | "error" | "same"> => {
    const codeToApply = code?.trim() ?? promo?.code.trim();
    if (!codeToApply) return "error";

    // Prevent re-applying the same code
    if (codeToApply === lastAppliedCode) return "same";

    try {
      const response = await axios.post("/promo-code/validate", { promo_code: codeToApply });

      if (response.data.success) {
        const promoData: PromoCode = response.data.promo;

        setPromo(promoData);
        setIsPromoValid(true);
        setLastAppliedCode(promoData.code);

        localStorage.setItem("promo", JSON.stringify(promoData));
        return "success";
      } else {
        setPromo(null);
        setIsPromoValid(false);
        localStorage.removeItem("promo");
        return "error";
      }
    } catch (err) {
      console.error("Error applying promo code:", err);
      setPromo(null);
      setIsPromoValid(false);
      localStorage.removeItem("promo");
      return "error";
    }
  };

  return (
    <PromoContext.Provider
      value={{
        promo,
        setPromo,
        isPromoValid,
        applyPromoCode,
      }}
    >
      {children}
    </PromoContext.Provider>
  );
};
