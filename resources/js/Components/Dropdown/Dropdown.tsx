import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowIcon from '@/Components/Icon/ArrowIcon';

interface DropdownItem {
  id: number | string;
  label: string;
  extra?: ReactNode; // Optional extra info to render
}

interface DropdownProps {
  items: DropdownItem[];
  selectedItemId?: number | string | null;
  onSelect: (id: number | string) => void;
  onCustomAction?: () => void;
  customActionLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  items,
  selectedItemId,
  onSelect,
  onCustomAction,
  customActionLabel,
  placeholder = 'Select an option',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = items.find(item => item.id === selectedItemId);

  return (
    <div
      className={`relative w-full ${disabled ? ' cursor-not-allowed' : ''}`}
      ref={dropdownRef}
      onMouseEnter={() => !disabled && setIsOpen(true)}
      onMouseLeave={() => !disabled && setIsOpen(false)}
    >
      <button
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        disabled={disabled}
        className="px-4 py-2 w-full border border-gray-300 dark:border-white/20 rounded-md flex bg-white dark:bg-[#1e2124]/60 justify-between items-center text-left text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {selectedItem ? selectedItem.label : placeholder}
        <ArrowIcon w="16" h="16" isOpen={isOpen} />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-1 w-full bg-white dark:bg-[#424549] shadow-lg rounded-md border border-gray-300 dark:border-white/20 rounded z-50"
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!disabled) {
                    onSelect(item.id);
                    setIsOpen(false); // Close the dropdown when an item is selected
                  }
                }}
                className={`cursor-pointer px-4 py-2 text-sm dark:text-gray-200 text-gray-800 hover:bg-gray-400 dark:hover:bg-[#7289da]/70 ${
                  selectedItemId === item.id ? 'font-semibold' : ''
                } ${i === 0 ? 'rounded-t-md' : ''} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {item.label}
                {item.extra && <span className="ml-2">{item.extra}</span>}
              </div>
            ))}

            {onCustomAction && customActionLabel && (
              <div
                onClick={() => {
                  if (!disabled) {
                    onCustomAction();
                    setIsOpen(false); // Close the dropdown after custom action
                  }
                }}
                className="cursor-pointer px-4 py-2 text-sm text-yellow-500 dark:text-[#7289da] font-semibold hover:underline"
              >
                {customActionLabel}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
