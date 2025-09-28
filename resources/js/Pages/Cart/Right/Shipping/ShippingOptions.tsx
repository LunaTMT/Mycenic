import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '@/Contexts/Shop/Cart/CartContext';
import { useShipping } from '@/Contexts/User/ShippingContext';
import Dropdown from '@/Components/Dropdown/Dropdown';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowIcon from '@/Components/Icon/ArrowIcon';
import axios from 'axios';

interface ShippingRate {
  id: string | number;
  provider?: string;
  servicelevel?: string;
  amount: number;
}

const ShippingOptions: React.FC = () => {
  const { cart } = useCart();
  const { selectedAddress, setShippingCost, rates } = useShipping();

  
  const [selectedRateId, setSelectedRateId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const firstFetch = useRef(true); // Prevent first automatic fetch
  const firstMount = useRef(true); // For dropdown animation


  // Open dropdown on first mount
  useEffect(() => {
    if (firstMount.current) {
      const timer = setTimeout(() => {
        setDropdownOpen(true);
      }, 100);
      firstMount.current = false;
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (id: string | number) => {
    setSelectedRateId(id);
    const rate = rates.find((r) => r.id === id);
    if (rate) {
      setShippingCost(rate.amount);
      console.log('Shipping rate selected:', rate);  // Log the rate selection
    }
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  return (
    <div className="space-y-4 w-full">
      <button
        onClick={toggleDropdown}
        className="w-full text-sm mb-2 text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
      >
        Shipping Options
        <ArrowIcon w="24" h="24" isOpen={dropdownOpen} />
      </button>

      <AnimatePresence initial={false}>
        {dropdownOpen && (
          <motion.div
            key="shippingOptionsDropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-4"
          >
            <Dropdown
              items={
                loading || !selectedAddress
                  ? []
                  : rates.map((r) => ({
                      id: r.id,
                      label: `${r.provider} - ${r.servicelevel} - £${r.amount}`,
                    }))
              }
              selectedItemId={selectedRateId}
              onSelect={handleSelect}
              placeholder={
                !selectedAddress
                  ? 'Add a shipping address first'
                  : loading
                  ? 'Loading shipping options...'
                  : 'Select Shipping Option'
              }
              disabled={loading || !selectedAddress}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingOptions;
