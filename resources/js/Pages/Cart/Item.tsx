import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { XIcon } from "lucide-react";
import Counter from "@/Components/Buttons/Counter";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { CartItem } from "@/types/Cart";
import { motion } from "framer-motion";  // Import framer-motion

interface CartItemProps {
  cartItem: CartItem;
}

const Item: React.FC<CartItemProps> = ({ cartItem }) => {
  const { updateQuantity, removeItem } = useCart();
  const item = cartItem.item;

  // Local state to manage animation state
  const [isDeleted, setIsDeleted] = useState(false);

  // Function to handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      // If the quantity goes to 0, remove the item from the cart
      removeItem(cartItem.id);
    } else {
      // Otherwise, update the quantity
      updateQuantity(cartItem.id, newQuantity);
    }
  };

  // Handle delete (if passed as a prop)
  const handleDelete = () => {
    // Trigger delete animation first
    setIsDeleted(true);

    // After the animation completes, remove the item from the cart
    setTimeout(() => {
      removeItem(cartItem.id);
    }, 300); // Adjust time to match the duration of your animation
  };

  return (
    <motion.div
      className="relative flex gap-4 w-full p-2 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60 border-l-4 border-yellow-500 dark:border-[#7289da]"
      initial={{ opacity: 1 }}  // Initial state
      animate={{ opacity: isDeleted ? 0 : 1 }}  // Animate opacity when deleted
      transition={{ duration: 0.3 }}  // Duration of the animation
    >
      {/* Delete Icon */}
      <button
        onClick={handleDelete}  // Call handleDelete for animation
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
        aria-label="Remove item"
      >
        <XIcon className="w-6 h-6" />
      </button>

      {/* Image */}
      <div className="flex-shrink-0 w-28 h-28 relative">
        <Link href={route("item", { id: item.id })} className="block h-full w-full">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-contain rounded-md border border-gray-400/40 dark:border-white/10"
          />
        </Link>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-h-[112px]">
        <div className="pr-8">
          <Link href={route("item", { id: item.id })}>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
              {item.name.split("-")[0]}
            </h2>
          </Link>

          {/* Selected Options */}
          {cartItem.selectedOptions && Object.keys(cartItem.selectedOptions).length > 0 && (
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {Object.entries(cartItem.selectedOptions)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}
            </div>
          )}
        </div>

        {/* Price and Counter at bottom */}
        <div className="flex justify-between items-center mt-4">
          {/* Single item price */}
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">
            £{item.price.toFixed(2)}
          </div>

          {/* Counter + total price */}
          <div className="flex items-center gap-2">
            <Counter
              quantity={cartItem.quantity}
              maxStock={item.stock ?? Infinity}
              onChange={handleQuantityChange}  // Use custom handler
              onDelete={handleDelete}  // Pass onDelete to Counter
              className="w-24 h-9 p-1"
            />
            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
              £{(item.price * cartItem.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Item;
