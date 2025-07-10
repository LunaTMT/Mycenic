import React from 'react';
import { motion } from 'framer-motion';
import TextInput from "@/Components/Login/TextInput";
import ArrowIcon from "@/Components/Buttons/ArrowButton";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";

const PromoCodeSection: React.FC = () => {
  const {
    promoCode,

    setPromoCode,
    handlePromoCodeValidation,
    isPromoCodeDropdownOpen,
    togglePromoCodeDropdown
  } = useCart();

  return (
    <>
      <button
        onClick={() => togglePromoCodeDropdown()}
        className="w-full text-sm text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
      >
        Promotion Code <ArrowIcon w="24" h="24" isOpen={isPromoCodeDropdownOpen} />
      </button>

  
      {isPromoCodeDropdownOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative flex rounded-md  overflow-hidden mt-2"
        >
          <TextInput
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="w-full h-10 border-r-0 rounded-l-full pl-5 bg:transparent rounded-e-none focus:outline-none focus:ring-0"
          />
          <button
            onClick={handlePromoCodeValidation}
            className={`w-[30%] h-10 border border-gray-400 text-sm font-medium rounded-r-full transition-colors
              ${promoCode.trim().length > 0 ? "text-black dark:text-white" : "text-gray-400"}
            `}
          >
            Apply
          </button>
        </motion.div>
      )}
    
    </>
  );
};

export default PromoCodeSection;