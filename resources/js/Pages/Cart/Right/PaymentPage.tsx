import React, { useState, useImperativeHandle, forwardRef } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { useUser } from "@/Contexts/UserContext";
import { useShipping } from "@/Contexts/Profile/ShippingContext";
import axios from "axios";
import { router } from "@inertiajs/react";

interface PaymentPageProps {
  total: number;
}

export interface PaymentPageRef {
  handleSubmit: () => Promise<void>;
}

const PaymentPage = forwardRef<PaymentPageRef, PaymentPageProps>(({ total }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const { darkMode } = useDarkMode();
  const { cart, clearCart, promoCode } = useCart();
  const { user } = useUser();
  const { shippingDetails } = useShipping();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      // 1️⃣ Create PaymentIntent on backend
      const intentRes = await axios.post("/payment/create-intent", {
        amount: Math.round(total * 100), // Stripe expects amount in pence
      });

      const clientSecret = intentRes.data.clientSecret;

      // 2️⃣ Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email: user?.email },
        },
      });

      if (error) throw error;

      // 3️⃣ Call checkout process with backend
      const response = await axios.post("/checkout/process", {
        cart,
        payment_intent_id: paymentIntent!.id,
        email: user?.email,
        shipping_address: shippingDetails,
        promo_code: promoCode,
      });

      toast.success("Checkout successful!");
      clearCart();

      router.visit("/checkout/success", {
        data: { order_id: response.data.order_id },
      });
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ handleSubmit }));

  return (
    <div className="w-full h-[2.5rem] rounded-md border-1 border-black/20 dark:border-white/20 bg-white dark:bg-[#1e2124]/60 shadow-2xl p-2">
      <CardElement
        options={{
          style: {
            base: {
              color: darkMode ? "#ffffff" : "#1f2937",
              fontSize: "16px",
              fontFamily: "inherit",
              "::placeholder": { color: "#9ca3af" },
              iconColor: darkMode ? "#ffffff" : "#1f2937",
            },
            invalid: { color: "#e53e3e", iconColor: "#e53e3e" },
          },
        }}
      />
    </div>
  );
});

export default PaymentPage;
