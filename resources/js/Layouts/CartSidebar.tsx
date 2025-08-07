import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CartSidebar() {
  const { cart, cartOpen, setCartOpen } = useCart();

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          key="cart"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 shadow-lg border-t border-gray-300 dark:border-gray-700 w-full max-w-md mx-auto"
          aria-label="Shopping Cart Dropdown"
        >
          <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
            <button
              onClick={() => setCartOpen(false)}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close Cart"
            >
              ✕
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-4">
            {(cart.cart_items?.length ?? 0) === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
            ) : (
              cart.cart_items?.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2"
                >
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold">{item.name}</p>
                    <p className="text-gray-700 dark:text-gray-300">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-gray-900 dark:text-white">
                    £{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-300 dark:border-gray-700">
            <button
              onClick={() => {
                window.location.href = "/checkout";
                setCartOpen(false);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Checkout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
