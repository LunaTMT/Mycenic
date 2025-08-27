import React from "react";
import { Head, usePage } from "@inertiajs/react";

import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import Item from "./Item";
import PromoCode from "./PromoCode";
import OrderNote from "./OrderNote";
import Shipping from "./Shipping/Shipping";

import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { User } from "@/types/User";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";  // Import the button

const Cart: React.FC = () => {
  const { auth } = usePage().props as { auth?: { user?: User } };
  const Layout = auth ? AuthenticatedLayout : GuestLayout;

  const { cart, subtotal, shippingCost, tax } = useCart();
  
  // Calculate the estimated total
  const estimatedTotal = subtotal + shippingCost + tax;

  return (
    <Layout>
      <Head title="Cart" />

      <div className="relative min-h-[89vh] p-5 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex gap-10 justify-center items-start">
        {/* Left side: Items */}
        <div className="w-[65%] space-y-3 flex flex-col justify-start items-center min-h-[80vh] rounded-lg p-4 bg-white/50 border border-black/20 dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 backdrop-blur-sm">
          {cart.items.map((item, index) => (
            <Item key={index} cartItem={item} />
          ))}
        </div>

        {/* Right side: PromoCode + OrderNote */}
        <div className="w-[35%] relative">
          <div className="rounded-lg font-Poppins border p-4 bg-white dark:bg-[#424549] border-black/20 dark:border-white/20 flex flex-col space-y-4">
            <PromoCode />
            <OrderNote />
            <Shipping />

            {/* Estimated Total */}
            <div className="flex justify-between items-center font-semibold text-xl text-gray-900 dark:text-white mt-6">
              <span>Estimated Total</span>
              <span>£{estimatedTotal.toFixed(2)}</span>
            </div>

            {/* Tax and Shipping Details */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              <p>Tax included</p>
              <p>Shipping calculated at checkout</p>
            </div>

            {/* Checkout Button */}
            <div className="mt-6">
              <PrimaryButton
                onClick={() => window.location.href = "/checkout"}
                className="w-full py-3 text-lg"
              >
                Proceed to Checkout
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
