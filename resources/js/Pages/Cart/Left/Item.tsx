import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { XIcon } from "lucide-react";
import Counter from "@/Components/Buttons/Counter";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { CartItem } from "@/types/Cart/Cart";
import { motion } from "framer-motion";

interface CartItemProps {
  cartItem: CartItem;
  canChange?: boolean;
}

const Item: React.FC<CartItemProps> = ({ cartItem, canChange = true }) => {
  

  const { updateQuantity, removeItem } = useCart();
  const [isDeleted, setIsDeleted] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    // Pass the full cartItem and new quantity
    updateQuantity(cartItem, newQuantity);
  };

  const handleDelete = () => {
    setIsDeleted(true);
    setTimeout(() => removeItem(cartItem), 300); // Pass the full cartItem instead of just item.id
  };

  const item = cartItem.item; // Get item from cartItem

  return (
    <motion.div
      className="relative flex gap-4 w-full p-2 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60 border-l-4 border-yellow-500 dark:border-[#7289da]"
      initial={{ opacity: 1 }}
      animate={{ opacity: isDeleted ? 0 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {canChange && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
          aria-label="Remove item"
        >
          <XIcon className="w-6 h-6" />
        </button>
      )}

      <div className="flex-shrink-0 w-28 h-28 relative">
        <Link href={route("items.show", { item: item.id })} className="block h-full w-full">
          <img
            src={item.thumbnail || "/placeholder.png"}  // Use `item.thumbnail`
            alt={item.name}  // Use `item.name`
            className="h-full w-full object-contain rounded-md border border-gray-400/40 dark:border-white/10"
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-[112px]">
        <div className="pr-8">
          <Link href={route("items.show", { item: item.id })}>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
              {item.name.split("-")[0]}  {/* Use `item.name` */}
            </h2>
          </Link>

          {cartItem.selected_options && Object.keys(cartItem.selected_options).length > 0 && (
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {Object.entries(cartItem.selected_options)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">
            £{item.price.toFixed(2)}  {/* Use `item.price` */}
          </div>

          <div className="flex items-center gap-2">
            {canChange ? (
              <Counter
                quantity={cartItem.quantity}
                maxStock={item.weight ? Infinity : Infinity} // You can adjust max stock as needed
                onChange={handleQuantityChange}
                onDelete={handleDelete}
                className="w-24 h-9 p-1"
              />
            ) : (
              <p className="px-2 text-gray-500 select-none">x{cartItem.quantity}</p>
            )}

            <div className="text-base font-medium text-gray-900 dark:text-gray-100">
              £{(item.price * cartItem.quantity).toFixed(2)}  {/* Use `item.price` * `cartItem.quantity` */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Item;
