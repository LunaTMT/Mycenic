import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface PromoContextType {
  promoCode: string;
  setPromoCode: React.Dispatch<React.SetStateAction<string>>;
  discountPercentage: number;
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
  const [promoCode, setPromoCode] = useState<string>("");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [isPromoValid, setIsPromoValid] = useState<boolean>(false);
  const [lastAppliedCode, setLastAppliedCode] = useState<string>("");

  // Load promo code and discount from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem("promoCode");
    const savedDiscount = localStorage.getItem("discountPercentage");

    if (savedCode) setPromoCode(savedCode);
    if (savedDiscount) setDiscountPercentage(Number(savedDiscount));
    if (savedCode && savedDiscount) setIsPromoValid(true);

    if (savedCode) setLastAppliedCode(savedCode);
  }, []);

  const applyPromoCode = async (code?: string): Promise<"success" | "error" | "same"> => {
    const codeToApply = code?.trim() ?? promoCode.trim();
    if (!codeToApply) return "error";

    // Check if the same code is already applied
    if (codeToApply === lastAppliedCode) return "same";

    try {
      const response = await axios.post("/promo-code/validate", { promo_code: codeToApply });

      if (response.data.success) {
        setDiscountPercentage(response.data.discount);
        setIsPromoValid(true);
        setPromoCode(codeToApply);
        setLastAppliedCode(codeToApply);

        localStorage.setItem("promoCode", codeToApply);
        localStorage.setItem("discountPercentage", String(response.data.discount));
        return "success";
      } else {
        setDiscountPercentage(0);
        setIsPromoValid(false);
        localStorage.removeItem("promoCode");
        localStorage.removeItem("discountPercentage");
        return "error";
      }
    } catch (err) {
      
      console.error("Error applying promo code:", err);
      setDiscountPercentage(0);
      setIsPromoValid(false);
      localStorage.removeItem("promoCode");
      localStorage.removeItem("discountPercentage");
      return "error";
    }
  };

  return (
    <PromoContext.Provider
      value={{
        promoCode,
        setPromoCode,
        discountPercentage,
        isPromoValid,
        applyPromoCode,
      }}
    >
      {children}
    </PromoContext.Provider>
  );
};
