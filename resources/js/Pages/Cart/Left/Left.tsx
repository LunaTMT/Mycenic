import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Item from "./Item";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { useCheckout } from "@/Contexts/Shop/Cart/CheckoutContext";
import { CartItem } from "@/types/Cart";

const Left: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const { cart } = useCart(); // Get cart from CartContext
  const { step } = useCheckout(); // Get step from CheckoutContext


  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="w-[60%] flex flex-col space-y-4 p-4 bg-white/50 dark:bg-[#424549]/80 border border-black/20 dark:border-white/20 rounded-lg text-gray-800 dark:text-gray-200 backdrop-blur-sm min-h-[80vh]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {(cart?.items ?? []).map((cartItem: CartItem) => (
          <motion.div
            key={cartItem.id + JSON.stringify(cartItem.selected_options)}
            variants={itemVariants}
            layout
            className="w-full"
          >
            <Item cartItem={cartItem} canChange={step === "cart"} />
          </motion.div>
        ))}
      </AnimatePresence>

    </motion.div>
  );
};

export default Left;
