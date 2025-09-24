import React, { createContext, useContext, useState, ReactNode } from "react";

type CheckoutStep = "cart" | "shipping" | "order_notifications" | "checkout";

interface CheckoutContextType {
  step: CheckoutStep;
  setStep: React.Dispatch<React.SetStateAction<CheckoutStep>>;
  nextStep: () => void;
  prevStep: () => void;
  orderNote: string;
  setOrderNote: React.Dispatch<React.SetStateAction<string>>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const useCheckout = (): CheckoutContextType => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error("useCheckout must be used within CheckoutProvider");
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {
  const steps: CheckoutStep[] = ["cart", "shipping", "order_notifications", "checkout"];
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [orderNote, setOrderNote] = useState("");

  const nextStep = () => {
    const idx = steps.indexOf(step);
    setStep(idx < steps.length - 1 ? steps[idx + 1] : step);
  };

  const prevStep = () => {
    const idx = steps.indexOf(step);
    setStep(idx > 0 ? steps[idx - 1] : step);
  };

  return (
    <CheckoutContext.Provider
      value={{
        step,
        setStep,
        nextStep,
        prevStep,
        orderNote,
        setOrderNote,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
