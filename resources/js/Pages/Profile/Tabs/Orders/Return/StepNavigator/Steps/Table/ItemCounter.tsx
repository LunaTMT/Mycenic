import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";

interface CounterProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  className?: string;
  max?: number;
  disabled?: boolean;
}

const ItemCounter: React.FC<CounterProps> = ({
  quantity,
  onQuantityChange,
  className = "",
  max,
  disabled = false,
}) => {
  const [isPopping, setIsPopping] = useState<boolean>(false);
  const { darkMode } = useDarkMode();

  const triggerPop = () => {
    setIsPopping(true);
    setTimeout(() => setIsPopping(false), 150);
  };

  const handleMinus = () => {
    if (disabled) return;

    if (quantity <= 1) {
      toast.info("You can't go below 1 item");
      return;
    }

    triggerPop();
    onQuantityChange(quantity - 1);
  };

  const handlePlus = () => {
    if (disabled) return;

    if (typeof max === "number" && quantity >= max) {
      toast.error("Max reached");
      return;
    }

    triggerPop();
    onQuantityChange(quantity + 1);
  };

  return (
    <div
      className={`flex items-center justify-between rounded-full shadow-lg text-white overflow-hidden transition-all duration-500
        dark:border-white/30 dark:bg-[#7289da] bg-yellow-500
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${className}
      `}
    >
      <button
        className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500 active:transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleMinus}
        disabled={disabled}
      >
        -
      </button>

      <motion.div
        animate={isPopping ? { scale: 1.3 } : { scale: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex items-center justify-center w-1/3 h-full font-semibold"
      >
        {quantity}
      </motion.div>

      <button
        className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500 active:transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handlePlus}
        disabled={disabled}
      >
        +
      </button>
    </div>
  );
};

export default ItemCounter;
