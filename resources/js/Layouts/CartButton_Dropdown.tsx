import React, { useState, useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Inertia } from "@inertiajs/inertia";
import { router } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { IoBagOutline, IoClose } from "react-icons/io5";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { useCart } from "@/Contexts/CartContext";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";


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

const stripePromise = loadStripe("your-publishable-key-here"); // Replace with your Stripe public key

const CartButton_Dropdown = () => {
  const {
    cart,
    totalItems,
    scaled,
    isModalDropdownOpen,
    setIsModalDropdownOpen,
    shippingDetails,
    paymentDetails,
    total,
    fetchShippingRates
  } = useCart();

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const displayCount = totalItems > 9 ? "9+" : totalItems;
  const latestItem = cart[cart.length - 1];

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();

  const hasShipping = Boolean(shippingDetails);

  const handleProceed = async () => {
    setIsModalDropdownOpen(false)
    
    if (!shippingDetails) {
      router.get(route("cart.get.shipping.details"));
    } else if (!paymentDetails) {
      fetchShippingRates();
      router.get(
        route("payment.index"),
        
        { amount: total },
        {
          onSuccess: (page) => {
            if (page.props.clientSecret) {
              setClientSecret(page.props.clientSecret);
            }
          },
        }
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModalDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsModalDropdownOpen]);

  return (
    <div className="relative">
      {/* Cart Icon */}
      <div
        onClick={() => Inertia.visit(route("cart"))}
        className="cursor-pointer"
        aria-label="Open cart"
      >
        <motion.div
          className={`relative w-9 h-9 flex items-center justify-center ${
            scaled ? "text-black" : "text-slate-700"
          }`}
          whileHover={{ scale: 1.1 }}
          animate={{ scale: scaled ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <IoBagOutline className="w-8 h-8 dark:text-slate-300 dark:hover:text-white" />
          {cart.length > 0 && (
            <motion.div
              className="absolute w-5 h-5 mt-2 dark:text-white font-bold text-xs rounded-full flex items-center justify-center shadow-lg text-black"
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: scaled ? 1.1 : 1 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.5 }}
            >
              {displayCount}
            </motion.div>
          )}
        </motion.div>
      </div>

      {cart.length > 0 &&
        createPortal(
          <Transition
            show={isModalDropdownOpen}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsModalDropdownOpen(false)}
            >
              <div className="relative h-full" onClick={(e) => e.stopPropagation()}>
                <motion.div
                  id={dropdownId}
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-[21%] top-[6%] w-[400px] dark:text-white bg-white dark:bg-[#424549] border border-black/30 dark:border-gray-500 rounded-md shadow-2xl z-50 overflow-hidden"
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setIsModalDropdownOpen(false)}
                    className="absolute top-2 right-4 text-2xl z-10 font-bold text-black dark:text-white"
                    aria-label="Close"
                  >
                    <IoClose />
                  </button>

                  <div className="relative p-4 space-y-4">
                    {/* Success message */}
                    <div className="flex items-center gap-2 text-green-500 dark:text-green-500 font-semibold text-md">
                      <FaCheckCircle className="text-green-500 dark:text-green-400" />
                      Added to bag
                    </div>

                    {/* Latest item preview */}
                    {latestItem && (
                      <div className="flex items-center gap-4 rounded-md">
                        <img
                          src={`/${latestItem.image.replace(/^\/+/, "")}`}
                          alt={latestItem.name}
                          className="w-26 h-26 object-contain"
                        />
                        <div>
                          <p className="block font-medium dark:text-white">
                            {latestItem.name.split("-")[0]}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Qty: {latestItem.quantity} — £{latestItem.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Footer buttons */}
                    <div className="flex flex-col gap-2 justify-between items-center">
                      <SecondaryButton
                        onClick={() => Inertia.visit(route("cart"))}
                        className="text-sm w-full dark:text-white"
                      >
                        View Cart ({totalItems})
                      </SecondaryButton>

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
                  </div>
                </motion.div>
              </div>
            </div>
          </Transition>,
          document.body
        )}
    </div>
  );
};

export default CartButton_Dropdown;
