import React, { useRef } from "react";
import { toast } from "react-toastify";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import PromoCode from "./PromoCode";
import OrderNote from "./OrderNote";
import ShippingAddress from "./Shipping/ShippingAddress";
import ShippingOptions from "./Shipping/ShippingOptions";
import OrderNotification from "./OrderNotification";
import PaymentPage, { PaymentPageRef } from "./PaymentPage";

import { useShipping } from "@/Contexts/User/ShippingContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { useUser } from "@/Contexts/User/UserContext";
import { useCheckout } from "@/Contexts/Shop/Cart/CheckoutContext";
import { usePromo } from "@/Contexts/Shop/Cart/PromoContext";

import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY!);

const RightContent: React.FC = () => {
  const { subtotal, cart } = useCart();
  const { discountPercentage } = usePromo();
  const { selectedAddress, shippingCost } = useShipping();
  const { user } = useUser();
  const { step, nextStep, prevStep } = useCheckout();

  const paymentRef = useRef<PaymentPageRef>(null);

  const cartIsEmpty = (cart?.items ?? []).length === 0;

  // --- CALCULATE DISCOUNT + TOTAL ---
  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount + (shippingCost || 0);

  const handleProceed = () => {
    if (cartIsEmpty) return;

    if (step === "shipping" && (!selectedAddress || shippingCost <= 0)) {
      toast.error("Please select a shipping option first.");
      return;
    }

    if (step === "order_notifications" && !user?.email) {
      toast.error("Please provide an email address to continue.");
      return;
    }

    if (step === "checkout") {
      paymentRef.current?.handleSubmit();
      return;
    }

    nextStep();
  };

  const handleBack = () => prevStep();

  return (
    <div className="w-[40%] flex flex-col space-y-4">
      <div className="flex flex-col space-y-4 p-4 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-[#424549] border-black/20 dark:border-white/20 font-Poppins">

        {step === "cart" && (
          <>
            <PromoCode />
            <OrderNote />
          </>
        )}

        {step === "shipping" && (
          <div className="space-y-6">
            <ShippingAddress />
            <ShippingOptions />
          </div>
        )}

        {step === "order_notifications" && <OrderNotification />}

        <div className="border-t border-black/20 dark:border-white/20" />

        <div className="flex justify-between items-center font-semibold text-lg">
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>

        {shippingCost > 0 && (
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Shipping</span>
            <span className="text-green-600">£{shippingCost.toFixed(2)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between items-center font-semibold text-lg">
            <span>Discount ({discountPercentage}%)</span>
            <span className="text-green-600">-£{discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center font-semibold text-xl">
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>

        <div className="border-t border-black/20 dark:border-white/20" />

        {step === "checkout" && (
          <Elements stripe={stripePromise}>
            <PaymentPage ref={paymentRef} total={total} />
          </Elements>
        )}

        {!cartIsEmpty && (
          <div className="flex gap-2 mt-4">
            {step !== "cart" && (
              <SecondaryButton onClick={handleBack} className="flex-1 py-3 text-lg">
                Back
              </SecondaryButton>
            )}
            <PrimaryButton onClick={handleProceed} className="flex-1 py-3 text-lg">
              {step === "cart"
                ? "Proceed to Shipping"
                : step === "shipping"
                ? "Proceed to Updates"
                : step === "order_notifications"
                ? "Proceed to Checkout"
                : `Pay Now £${total.toFixed(2)}`}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

const Right: React.FC = () => <RightContent />;

export default Right;
