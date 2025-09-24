import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useCheckout } from "@/Contexts/Shop/Cart/CheckoutContext";

const MAX_LENGTH = 250;

const OrderNote: React.FC = () => {
  const { orderNote, setOrderNote } = useCheckout(); // <-- useCheckout now
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsDropdownOpen(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_LENGTH) {
      setOrderNote(val);
      setError(null);
    }
  };

  return (
    <div>
      <button
        onClick={toggleDropdown}
        className="w-full text-sm mb-2 text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
      >
        Order Note <ArrowIcon w="24" h="24" isOpen={isDropdownOpen} />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            key="dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <div className="relative w-full">
                <textarea
                  id="orderNote"
                  value={orderNote}
                  onChange={handleNoteChange}
                  placeholder="Write your order note here..."
                  rows={4}
                  className="
                    w-full
                    bg-white dark:bg-[#1e2124]/60
                    text-gray-900 dark:text-gray-100
                    px-4 py-2 text-md
                    rounded-md
                    border dark:border-white/20 border-black/20
                    min-h-[250px]
                    focus:outline-none focus:ring-0
                    resize-none
                  "
                />
                <span className="absolute bottom-5 right-3 text-xs text-gray-400 dark:text-gray-500 pointer-events-none select-none">
                  {orderNote.length} / {MAX_LENGTH}
                </span>
              </div>

              {error && (
                <div className="text-red-500 text-xs mt-1 select-none pointer-events-auto">
                  {error}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderNote;
