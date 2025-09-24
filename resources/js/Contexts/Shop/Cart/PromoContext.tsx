import React, { createContext, useContext, useState } from "react";
import axios from "axios";

// Define the shape of the PromoContext
interface PromoContextType {
  promoCode: string;
  setPromoCode: React.Dispatch<React.SetStateAction<string>>;
  discountAmount: number;  // Amount of discount (could be percentage or fixed amount)
  isPromoValid: boolean;
  applyPromoCode: () => Promise<void>;  // Function to validate and apply the promo code
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
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isPromoValid, setIsPromoValid] = useState<boolean>(false);

  // Function to validate and apply promo code
  const applyPromoCode = async () => {
    try {
      const response = await axios.post("/promo-code/validate", { promo_code: promoCode });
      
      if (response.data.valid) {
        setDiscountAmount(response.data.discountAmount); // Set the discount amount (could be percentage or fixed)
        setIsPromoValid(true);
        console.log("Promo code applied successfully!");
      } else {
        setIsPromoValid(false);
        console.log("Invalid promo code.");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setIsPromoValid(false);
    }
  };

  return (
    <PromoContext.Provider
      value={{
        promoCode,
        setPromoCode,
        discountAmount,
        isPromoValid,
        applyPromoCode,  // Updated function name
      }}
    >
      {children}
    </PromoContext.Provider>
  );
};
