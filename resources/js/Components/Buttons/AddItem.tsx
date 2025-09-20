import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export default function AddButton({ onClick, isActive }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isActive ? 'Hide add address form' : 'Show add address form'}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-white shadow-lg hover:bg-yellow-400 dark:bg-[#7289da] dark:hover:bg-[#5a6bcf] transition"
    >
      <AnimatePresence initial={false} mode="wait">
        {isActive ? (
          <motion.span
            key="minus"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold select-none"
          >
            −
          </motion.span>
        ) : (
          <motion.span
            key="plus"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold select-none"
          >
            +
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
