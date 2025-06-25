import { useEffect, useState } from "react";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify"; // Import Toastify
import { ToastContainer } from "react-toastify";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";

interface CounterProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  itemId: number;
  className?: string;
}

const Counter: React.FC<CounterProps> = ({ quantity, onQuantityChange, itemId, className = "" }) => {
  const { getStock } = useCart();
  const [stock, setStock] = useState<number>(0); // Set initial stock to 0
  const [isPopping, setIsPopping] = useState<boolean>(false);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    let isMounted = true;

    const fetchStock = async () => {
      const stockAmount = await getStock(itemId);
      if (isMounted) {
        setStock(stockAmount);
      }
    };

    fetchStock();
    return () => { isMounted = false; }; // Cleanup to prevent multiple updates
  }, [itemId, quantity, stock]); // Removed `getStock` from dependencies to prevent unnecessary re-fetches

  const triggerPop = () => {
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 150);
  };

  return (
    <div className={`flex items-center justify-between rounded-full shadow-lg border-black/20 border-[1px] text-black overflow-hidden transition-all duration-500
      dark:text-white dark:border-white/30 
      ${stock === 0 ? " cursor-not-allowed" : ""} ${className}`}>
      
      {/* Minus Button */}
      <button
        className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500
            active:transform active:translate-y-1 "
        onClick={() => {
          if (quantity > 1) {
            triggerPop();
            onQuantityChange(quantity - 1); // Decrease quantity
          }
        }}
        disabled={quantity <= 1} // Disable if quantity is 1 or less
      >
        -
      </button>

      {/* Quantity Display (Pops when updated) */}
      <motion.div
        animate={isPopping ? { scale: 1.3 } : { scale: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex items-center justify-center w-1/3 h-full font-semibold"
      >
        {quantity}
      </motion.div>

      {/* Plus Button */}
      <button
        className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500
            active:transform active:translate-y-1  disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          if (stock === 0) {
            toast.error("Max stock reached"); // Show toast when stock is 0
            return;
          }
          triggerPop();
          onQuantityChange(quantity + 1); // Increase quantity only if within stock limit
        }}
        disabled={stock === 0} // Disable if stock is 0
      >
        +
      </button>


    </div>
  );
};

export default Counter;
