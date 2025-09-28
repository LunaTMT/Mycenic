import React, { useRef, useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import PaymentPage, { PaymentPageRef } from "./PaymentPage";

import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { useUser } from "@/Contexts/User/UserContext";

import InputLabel from "@/Components/Login/InputLabel";
import TextInput from "@/Components/Login/TextInput";
import InputError from "@/Components/Login/InputError";
import ArrowIcon from "@/Components/Icon/ArrowIcon";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY!);

const CheckoutSection: React.FC = () => {
  const { subtotal, shippingCost, discount } = useCart();
  const { user } = useUser();
  const paymentRef = useRef<PaymentPageRef>(null);

  const [email, setEmail] = useState(user.isGuest ? "" : user.email);
  const [phone, setPhone] = useState(user.isGuest ? "" : user.phone || "");
  const [smsUpdates, setSmsUpdates] = useState(false);
  const [errors] = useState<{ email?: string; phone?: string }>({});
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const firstMount = useRef(true);

  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount + shippingCost;

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Open dropdown on first mount with a slight delay
  useEffect(() => {
    if (firstMount.current) {
      const timer = setTimeout(() => {
        setDropdownOpen(true);
      }, 100); // slight delay for animation
      firstMount.current = false;
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <div className="space-y-4">
        <button
          onClick={toggleDropdown}
          className="w-full text-sm mb-2 text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
        >
          Order Notifications
          <ArrowIcon w="24" h="24" isOpen={dropdownOpen} />
        </button>

        {dropdownOpen && user && (
          <>
            <div>
              <InputLabel htmlFor="email" value="Email" />
              <TextInput
                id="email"
                type="email"
                className="mt-1 block w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="you@example.com"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You’ll receive order updates via email.
              </p>
              <InputError
                className="mt-2 dark:text-red-400"
                message={errors?.email}
              />
            </div>


            {smsUpdates && (
              <div>
                <InputLabel htmlFor="phone" value="Phone" />
                <TextInput
                  id="phone"
                  type="tel"
                  className="mt-1 block w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7123 456789"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Please enter a number to recieve order updates via SMS.
              </p>
                <InputError
                  className="mt-2 dark:text-red-400"
                  message={errors?.phone}
                />
              </div>
            )}
          </>
        )}
        <div className="border-t border-black/20 dark:border-white/20" />
      </div>


    </>
  );
};

export default CheckoutSection;
