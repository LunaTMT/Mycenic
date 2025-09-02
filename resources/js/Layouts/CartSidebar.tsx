import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import { motion } from "framer-motion";
import { FiX, FiShoppingCart } from "react-icons/fi";
import Item from "@/Pages/Cart/Item";
import { router } from "@inertiajs/react"; // <-- import Inertia router

export default function CartSidebar() {
  const { cart, setCartOpen, subtotal } = useCart();

  return (
    <div className="w-full max-h-[90vh] flex flex-col bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#424549] p-5 border-b border-black/20 dark:border-white/20 flex justify-between items-center shadow-sm z-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shopping Cart</h2>
        <motion.button
          onClick={() => setCartOpen(false)}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close Cart"
          whileHover={{ rotate: 90, scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FiX size={24} />
        </motion.button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-2 py-4 space-y-2">
        {cart.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center  space-y-4">
            <div
              className={`
                flex items-center justify-center
                w-20 h-20 rounded-xl
                text-yellow-500 dark:text-[#7289da]
              `}
            >
              <FiShoppingCart size={50} />
            </div>

            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
              Your cart is empty.
            </p>
          </div>
        ) : (
          cart.items.map((cartItem) => (
            <Item
              key={cartItem.id + JSON.stringify(cartItem.selectedOptions)}
              cartItem={cartItem}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-[#424549] p-5 border-t border-black/20 dark:border-white/20 shadow-sm space-y-4 z-10">
        <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
          <span>Total</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex gap-4">
          <SecondaryButton
            onClick={() => setCartOpen(false)}
            className="w-1/2  p-3 text-md"
          >
            Back
          </SecondaryButton>

          <PrimaryButton
            onClick={() => {
              router.visit("/cart"); // <-- use Inertia router to navigate
              setCartOpen(false);
            }}
            className="w-1/2 p-3 text-md"
          >
            Proceed to Cart
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
