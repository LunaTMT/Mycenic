import React from "react";
import { Head, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";

import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import Item from "./Item";
import PromoCode from "./PromoCode";
import OrderNote from "./OrderNote";
import Shipping from "./Shipping/Shipping";

import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { User } from "@/types/User";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";

const Cart: React.FC = () => {
  const { auth } = usePage().props as { auth?: { user?: User } };
  const Layout = auth ? AuthenticatedLayout : GuestLayout;

  const { cart, subtotal, shippingCost, discount } = useCart();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount + shippingCost;

  return (
    <Layout>
      <Head title="Cart" />

      <div className="relative min-h-[89vh] p-5 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex gap-10 justify-center items-start">
        {/* Left side: Items */}
        <motion.div
          className="w-[65%] flex flex-col space-y-4 p-4 bg-white/50 dark:bg-[#424549]/80 border border-black/20 dark:border-white/20 rounded-lg text-gray-800 dark:text-gray-200 backdrop-blur-sm min-h-[80vh]"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.id + JSON.stringify(item.selectedOptions)}
                variants={itemVariants}
                layout
                className="w-full"
              >
                <Item cartItem={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Right side: Summary */}
        <div className="w-[35%] flex flex-col space-y-4">
          <div className="flex flex-col space-y-4 p-4 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-[#424549] border-black/20 dark:border-white/20 font-Poppins">
            
            {/* Section 1 */}
            <PromoCode />
            <OrderNote />
            <Shipping />
            
            <div className="border-t border-black/20 dark:border-white/20" />

            {/* Section 2: Pricing */}
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


            {discount > 0 && (
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Discount ({discount}%)</span>
                <span className="text-green-600">-£{discountAmount.toFixed(2)}</span>
              </div>
            )}


            <div className="flex justify-between items-center font-semibold text-xl">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>

            <div className="border-t border-black/20 dark:border-white/20" />

            {/* Checkout button */}
            <PrimaryButton
              onClick={() => (window.location.href = "/checkout")}
              className="w-full py-3 text-lg mt-4"
            >
              Proceed to Checkout
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
