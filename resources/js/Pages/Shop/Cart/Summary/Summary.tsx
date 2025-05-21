import React, { useState } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { router } from "@inertiajs/react";

import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import { useCart } from "@/Contexts/CartContext";
import PromoCodeSection from './PromoCodeSection';
import ShippingDetailsSection from './ShippingDetailsSection';

import { FaInfoCircle } from "react-icons/fa";
import Dropdown from '@/Components/Dropdown/Dropdown';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || "");

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);

  const confirmPayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      console.error(result.error.message);
      alert(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      router.visit(route('orders.create'));
    }

    setLoading(false);
  };

  return (
    <>
      <div className="border p-4 rounded mb-4 bg-white dark:bg-[#2c2f33]">
        <CardElement />
      </div>
      <PrimaryButton className="w-full" onClick={confirmPayment} disabled={loading || cart.length === 0}>
        {loading ? 'Processing…' : 'Pay Now'}
      </PrimaryButton>
    </>
  );
};

const Summary: React.FC<{ auth: any }> = ({ auth }) => {
  const {
    promoDiscount,
    discountAmount,
    subtotal,
    total,
    cart,
    shippingDetails,
    shippingCostEstimate,
    shippingCost,
    paymentDetails
  } = useCart();

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const hasShipping = shippingDetails && shippingCost !== null;

  const handleProceed = async () => {
    if (!shippingDetails) {
        router.get(route('cart.get.shipping.details'));
    } else if (!paymentDetails) {
        console.log("getting payment details");
        router.get(route('payment.index'), {
            amount: total,  // Total amount
        });
    }
};

  

  return (
    <div className="rounded-lg font-Poppins border h-fit p-4 border-black/20 bg-white dark:bg-[#424549] dark:border-white/20">
      <h1 className="text-4xl text-black text-left dark:text-white mb-7">Summary</h1>

      <div className="flex justify-between mb-4">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Subtotal</span>
        <span className="text-sm font-bold text-black dark:text-white">£{subtotal}</span>
      </div>

      <div className="mb-4">
        <ShippingDetailsSection />
      </div>

      {promoDiscount > 0 && (
        <div className="border-t border-gray-300 dark:border-white/50 pt-4 mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mr-2">
              Discount ({promoDiscount}%)
            </span>
            <Dropdown onOpenChange={() => {}}>
              <Dropdown.Trigger>
                <span className="cursor-pointer rounded-full w-5 h-5 flex items-center justify-center text-black dark:text-white">
                  <FaInfoCircle className="w-full h-full" />
                </span>
              </Dropdown.Trigger>
              <Dropdown.Content>
                <div className="relative z-50 w-64 text-xs p-2 rounded bg-black text-white shadow-md">
                  Please note, the discount applies to the subtotal and excludes delivery & handling fees.
                </div>
              </Dropdown.Content>
            </Dropdown>
          </div>
          <span className="text-sm font-bold text-green-500">-£{discountAmount}</span>
        </div>
      )}

      <PromoCodeSection />

      <div className="border-t border-gray-300 dark:border-white/50 pt-4 mt-4 flex justify-between mb-6">
        <h1 className="text-xl text-gray-800 dark:text-gray-200">Total</h1>
        <span className="text-lg font-bold text-black dark:text-white">
          {hasShipping
            ? `£${(parseFloat(total)).toFixed(2)}`
            : `£${Math.round(parseFloat(total) + shippingCostEstimate[0])} – £${Math.round(parseFloat(total) + shippingCostEstimate[1])}`}
        </span>
      </div>

      {!clientSecret ? (
        <PrimaryButton
          className="w-full"
          onClick={handleProceed}
          disabled={cart.length === 0}
        >
          {hasShipping ? "Proceed to Payment" : "Proceed to Shipping"}
        </PrimaryButton>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      )}
    </div>
  );
};

export default Summary;
