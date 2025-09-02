import "react-toastify/dist/ReactToastify.css";

interface CounterProps {
  quantity: number;
  onChange: (newQuantity: number) => void;
  onDelete?: () => void; // Optional onDelete callback
  maxStock?: number;
  className?: string;
}

const Counter: React.FC<CounterProps> = ({
  quantity,
  onChange,
  onDelete,
  maxStock = Infinity,
  className = "",
}) => {
  const handleDecrement = () => {
    if (quantity <= 1) {
      if (onDelete) {
        onDelete(); // Call the onDelete if available
      } else {
        
      }
      return;
    }
    onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity >= maxStock) {
      
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
          disabled={quantity <= 1 && !onDelete} // Disable if quantity is 1 and no onDelete
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
      
    </>
  );
};

export default Counter;
