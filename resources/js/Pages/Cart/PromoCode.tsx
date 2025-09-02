import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import axios from "axios";
import { toast } from "react-toastify";

const PromoCode: React.FC = () => {
  const [isPromoCodeDropdownOpen, setIsPromoCodeDropdownOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { setDiscount } = useCart();

  const togglePromoCodeDropdown = () => {
    setIsPromoCodeDropdownOpen(prev => !prev);
  };

  const handlePromoCodeValidation = async () => {
    if (promoCode.trim().length === 0) return;

    setLoading(true);
    try {
      const response = await axios.post('/promo-code/validate', { promoCode });
      console.log(response);
      // Backend returned success
      setDiscount(response.data.discount);
      setPromoCode(''); // clear input only on valid code
      toast.success(response.data.message);

    } catch (error: any) {
      // Invalid promo code
      setDiscount(0); // clear discount
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={togglePromoCodeDropdown}
        className="w-full text-sm mb-2 text-left bg-red font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
      >
        Promotion Code <ArrowIcon w="24" h="24" isOpen={isPromoCodeDropdownOpen} />
      </button>

      <AnimatePresence initial={false}>
        {isPromoCodeDropdownOpen && (
          <motion.div
            key="promoDropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="relative flex bg-white dark:bg-[#1e2124]/60 rounded-lg"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex w-full"
            >
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full h-10 border-r-0 rounded-l-lg pl-4 border bg-transparent dark:border-white/20 border-black/20 focus:outline-none focus:ring-0"
              />
              <button
                onClick={handlePromoCodeValidation}
                className={`w-[30%] h-10 border dark:border-white/20 border-black/20 rounded-r-lg text-sm font-medium transition-colors
                  ${promoCode.trim().length > 0 ? "text-black dark:text-white" : "text-gray-400"}
                `}
                disabled={loading}
              >
                Apply
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromoCode;
