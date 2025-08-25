import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextInput from "@/Components/Login/TextInput";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PromoCode: React.FC = () => {
  const [isPromoCodeDropdownOpen, setIsPromoCodeDropdownOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { cart, setCart, subtotal, total } = useCart();

  const togglePromoCodeDropdown = () => {
    setIsPromoCodeDropdownOpen(prev => !prev);
  };

  const handlePromoCodeValidation = async () => {
    if (promoCode.trim().length === 0) {
      toast.error('Please enter a promo code.');
      return;
    }

    setLoading(true);
    try {
      // API call to validate the promo code
      const response = await axios.post('/promo-code/validate', {
        promoCode: promoCode
      });

      const discount = response.data.discount;

      // Apply discount to the total (e.g., 10% off)
      const newTotal = subtotal - (subtotal * (discount / 100));

      // Update cart total with the discount
      setCart((prev) => ({
        ...prev,
        total: newTotal,
      }));

      setPromoCode('');
      toast.success('Promo code applied successfully!');
    } catch (error) {
      // Handle error (e.g., invalid promo code)
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('An error occurred, please try again later.');
      }
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
            className="relative flex rounded-md"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex w-full"
            >
              <TextInput
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full h-10 border-r-0 rounded-l-full pl-5 bg-transparent rounded-e-none focus:outline-none focus:ring-0"
              />
              <button
                onClick={handlePromoCodeValidation}
                className={`w-[30%] h-10 border border-gray-400 text-sm font-medium rounded-r-full transition-colors
                  ${promoCode.trim().length > 0 ? "text-black dark:text-white" : "text-gray-400"}
                `}
                disabled={loading}
              >
                {loading ? 'Validating...' : 'Apply'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromoCode;
