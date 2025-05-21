import { useEffect, useState } from "react";
import { useCart } from "@/Contexts/CartContext";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useDarkMode } from "@/Contexts/DarkModeContext";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

interface CounterProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  itemId: number;
  className?: string;
  disableDelete?: boolean;
}

const Counter: React.FC<CounterProps> = ({
  quantity,
  onQuantityChange,
  itemId,
  className = "",
  disableDelete = false,
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

  const handleDelete = () => {
    Swal.fire({
      title: "Remove item?",
      text: "Are you sure you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it",
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromCart(itemId);
      }
    });
  };

  const handleMinus = () => {
    if (quantity === 1) {
      if (disableDelete) return;
      handleDelete();
    } else {
      triggerPop();
      onQuantityChange(quantity - 1);
    }
  };

  const handlePlus = () => {
    if (stock === 0) {
      toast.error("Max stock reached");
      return;
    }
    triggerPop();
    onQuantityChange(quantity + 1);
  };

  return (
    <div className="flex items-center justify-end  w-full h-full ">
      {/* Trash Icon (left-aligned) */}
      {quantity >= 10 && !disableDelete && (
        <button
          onClick={handleDelete}
          className="
            flex items-center justify-center 
            rounded-full shadow-lg text-white 
            transition-all duration-200
            bg-yellow-500 hover:bg-yellow-600
            dark:bg-[#7289da] dark:hover:bg-[#5e6cbf]
            hover:scale-105 hover:shadow-2xl
            h-full p-2 mr-2
          "
        >
          <FaTrashAlt className="text-white text-lg" />
        </button>
      )}



      {/* Counter (right-aligned) */}
      <div
        className={`flex items-center justify-between rounded-full shadow-lg text-white overflow-hidden transition-all duration-500 dark:border-white/30 
        dark:bg-[#7289da] bg-yellow-500 ${className}`}
      >
        {/* Minus Button */}
        <button
          className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500 active:transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleMinus}
          disabled={disableDelete && quantity <= 1}
        >
          {quantity === 1 && !disableDelete ? (
            <FaTrashAlt className="text-xl" />
          ) : (
            "-"
          )}
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


    </div>
  );
};

export default Counter;
