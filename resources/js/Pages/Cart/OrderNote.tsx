import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrowIcon from "@/Components/Icon/ArrowIcon";

const MAX_LENGTH = 250;

const OrderNote: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [error, setError] = useState<string | null>(null);

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

      <AnimatePresence initial={false}>
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
            {/* Animate content opacity separately for smoother effect */}
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
                    bg-white dark:bg-[#1e2124]
                    text-gray-900 dark:text-gray-100
                    text-sm
                    px-2 pt-2 pb-6
                    rounded-md
                    border border-gray-300 dark:border-gray-600
                    min-h-[180px]
                    focus:outline-none focus:ring-0
                    resize-none
                  "
                />
                <span
                  className="
                    absolute bottom-6 right-3
                    text-xs text-gray-400 dark:text-gray-500
                    pointer-events-none
                    select-none
                  "
                >
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
