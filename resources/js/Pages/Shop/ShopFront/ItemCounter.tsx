import { useEffect, useState } from "react";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";
import { FaTrashAlt } from "react-icons/fa";

interface CounterProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  itemId: number;
  className?: string;
}

const ItemCounter: React.FC<CounterProps> = ({
  quantity,
  onQuantityChange,
  itemId,
  className = "",
}) => {
  const { getStock, removeFromCart } = useCart();
  const [stock, setStock] = useState<number>(0);
  const [isPopping, setIsPopping] = useState<boolean>(false);
  const { darkMode } = useDarkMode();

  useEffect(() => {
    let isMounted = true;
    const fetchStock = async () => {
      const stockAmount = await getStock(itemId);
      if (isMounted) setStock(stockAmount);
    };
    fetchStock();
    return () => {
      isMounted = false;
    };
  }, [itemId, quantity]);

  const triggerPop = () => {
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 150);
  };

  const handleMinus = () => {

    if (stock === 0) {
      return;
    }

    if (quantity === 1) {
      toast.info("You can't go below 1 item");
      return;
    }
  

    triggerPop();
    onQuantityChange(quantity - 1);
  };
  

  const handlePlus = () => {
    if (stock === 0) {
      return;
    }

    if (quantity >= stock){
      toast.error("You cannot go over the max stock");
      return;
    }

    triggerPop();
    onQuantityChange(quantity + 1);
  };

  return (
    <div
      className={`flex items-center justify-between rounded-full shadow-lg text-white overflow-hidden transition-all duration-500
        dark:border-white/30 dark:bg-[#7289da] bg-yellow-500
        ${stock === 0 ? "cursor-not-allowed opacity-50" : ""}
        ${className}
      `}
    >
      {/* Minus Button */}
      <button
        className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500 active:transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleMinus}
 
      >
        -
      </button>

      {/* Quantity Display */}
      <motion.div
        animate={isPopping ? { scale: 1.3 } : { scale: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex items-center justify-center w-1/3 h-full font-semibold"
      >
        {quantity}
      </motion.div>

      {/* Plus Button */}
      <button
        className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500 active:transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handlePlus}

      >
        +
      </button>


    </div>
  );
};

export default ItemCounter;
