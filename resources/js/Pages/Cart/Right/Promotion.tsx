import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { usePromotion } from "@/Contexts/Shop/Cart/PromoContext";
import { toast } from "react-toastify";

const Promotion: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState("");

  const { promotion, applyPromotion, clearPromotion } = usePromotion();

  useEffect(() => {
    const timer = setTimeout(() => setIsDropdownOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  const handleApply = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    const success = await applyPromotion(inputCode);
    setLoading(false);

    if (success) {
      toast.success("Promotion applied!");
      setInputCode("");
    } else {
      toast.error("Invalid promotion code.");
    }
  };

  const handleClear = () => {
    clearPromotion();
    toast.info("Promotion removed.");
  };

  return (
    <div>
      <button
        onClick={toggleDropdown}
        className="w-full text-sm mb-2 text-left bg-red font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
      >
        Promotion Code <ArrowIcon w="24" h="24" isOpen={isDropdownOpen} />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            key="promotionDropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
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
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                placeholder={promotion ? `Applied: ${promotion.code}` : "Enter promotion code"}
                className="w-full h-10 border-r-0 rounded-l-lg pl-4 border bg-transparent dark:border-white/20 border-black/20 focus:outline-none focus:ring-0"
                disabled={loading}
              />
              {promotion ? (
                <button
                  onClick={handleClear}
                  className="w-[30%] h-10 border dark:border-white/20 border-black/20 rounded-r-lg text-sm font-medium text-red-600"
                  disabled={loading}
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  className={`w-[30%] h-10 border dark:border-white/20 border-black/20 rounded-r-lg text-sm font-medium transition-colors
                    ${inputCode.trim().length > 0 ? "text-black dark:text-white" : "text-gray-400"}`}
                  disabled={loading || inputCode.trim().length === 0}
                >
                  {loading ? "..." : "Apply"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Promotion;
