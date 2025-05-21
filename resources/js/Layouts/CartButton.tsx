import { CiShoppingCart } from "react-icons/ci";
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface CartButtonProps {
  cart: any[];
  totalItems: number;
  scaled: boolean;
}

const CartButton = ({ cart, totalItems, scaled }: CartButtonProps) => {
  const displayCount = totalItems > 9 ? "9+" : totalItems;

  return (
    <Link href={route('cart')}>
      <motion.div
        className={`relative w-10 h-10 flex items-center justify-center ${scaled ? "text-black" : "text-slate-700"}`}
        whileHover={{ scale: 1.1 }} // Scale the whole component on hover
        animate={{ scale: scaled ? 1.1 : 1 }} // Scale the whole component based on scaled state
        transition={{ duration: 0.3 }}
      >
        <CiShoppingCart className="w-full h-full dark:text-slate-300 dark:hover:text-white" />
        
        {cart.length > 0 && (
          <motion.div
            className="absolute w-4 h-4 ml-1 dark:text-white font-bold text-xs rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: scaled ? 1.1 : 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.5 }}
          >
            {displayCount}
          </motion.div>
        )}
      </motion.div>
    </Link>
  );
};

export default CartButton;
