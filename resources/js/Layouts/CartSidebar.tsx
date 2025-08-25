import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import Counter from "@/Components/Buttons/Counter";
import { motion } from "framer-motion"
import { FiX } from "react-icons/fi"

export default function CartSidebar() {
  

  const { cart, setCartOpen, updateQuantity, subtotal } = useCart();


  console.log(cart);
  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 rounded-lg shadow-2xl overflow-hidden">
      
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
      <div className="flex-1 overflow-y-auto px-5 ">
        {cart.items?.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            Your cart is empty.
          </p>
        ) : (
          cart.items.map((cartItem) => (
            <div
              key={cartItem.id + JSON.stringify(cartItem.selectedOptions)}
              className="flex items-center gap-4 py-3"
            >
              {/* Item Image */}
              <img
                src={cartItem.item.image || "/placeholder.jpg"}
                alt={cartItem.item.name}
                className="w-20 h-20 object-cover rounded-lg shadow"
              />

              {/* Item Details */}
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-gray-900 dark:text-white font-medium line-clamp-1">
                  {cartItem.item.name}
                </p>
                {cartItem.selectedOptions &&
                  Object.entries(cartItem.selectedOptions).map(([option, value]) => (
                    <p key={option} className="text-xs text-gray-600 dark:text-gray-400">
                      {option}: {value}
                    </p>
                  ))}
              </div>

              {/* Quantity + Price */}
              <div className="flex flex-col items-end gap-2">
                <span className="text-gray-900 dark:text-gray-200 font-semibold whitespace-nowrap">
                  £{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                </span>
                <Counter
                  quantity={cartItem.quantity}
                  onChange={(newQty) =>
                    updateQuantity(cartItem.id, cartItem.selectedOptions, newQty)
                  }
                  maxStock={cartItem.item.stock}   // ✅ limit to stock
                  className="w-28 h-8"
                />

              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-[#424549] p-5 border-t border-black/20 dark:border-white/20 shadow-sm space-y-4 z-10">
        <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
          <span>Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex gap-4">
          <SecondaryButton
            onClick={() => setCartOpen(false)}
            className="w-1/2 py-3 text-lg"
          >
            Back
          </SecondaryButton>

          <PrimaryButton
            onClick={() => {
              window.location.href = "/checkout";
              setCartOpen(false);
            }}
            className="w-1/2 py-3 text-lg"
          >
            Proceed to Checkout
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
