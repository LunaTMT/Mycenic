import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CounterProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  maxStock?: number;
  className?: string;
}

const Counter: React.FC<CounterProps> = ({
  quantity,
  onChange,
  maxStock = Infinity,
  className = "",
}) => {
  const handleDecrement = () => {
    if (quantity <= 1) {
      toast.info("You can't go below 1 item");
      return;
    }
    onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity >= maxStock) {
      toast.error("You cannot go over the max stock");
      return;
    }
    onChange(quantity + 1);
  };

  return (
    <>
      <div
        className={`flex items-center justify-between rounded-full shadow-lg text-white overflow-hidden transition-all duration-500
          bg-yellow-500 dark:bg-[#7289da]
          dark:border-white/30
          ${maxStock === 0 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${className}`}
      >
        {/* Minus Button */}
        <button
          className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500 active:transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleDecrement}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
        >
          -
        </button>

        {/* Quantity Display */}
        <div className="flex items-center justify-center w-1/3 h-full font-semibold text-white">
          {quantity}
        </div>

        {/* Plus Button */}
        <button
          className="w-1/3 h-full flex items-center justify-center font-semibold transition-all duration-500 active:transform active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleIncrement}
          disabled={quantity >= maxStock}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <ToastContainer />
    </>
  );
};

export default Counter;
