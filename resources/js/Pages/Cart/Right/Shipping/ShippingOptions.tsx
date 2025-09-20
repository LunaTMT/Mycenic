import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/Contexts/Shop/Cart/CartContext';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import Dropdown from '@/Components/Dropdown/Dropdown';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowIcon from '@/Components/Icon/ArrowIcon';
import axios from 'axios';

interface ShippingRate {
  id: string;
  provider?: string;
  servicelevel?: string;
  amount: number;
}

const ShippingOptions: React.FC = () => {
  const { cart, setShippingCost } = useCart();
  const { selectedShippingDetail } = useShipping();

  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const firstFetch = useRef(true); // Prevent first automatic fetch
  const firstMount = useRef(true); // For dropdown animation

  // Fetch shipping rates whenever cart items or selected address changes
  useEffect(() => {
    const fetchShippingRates = async () => {
      if (!cart.items.length || !selectedShippingDetail) return;

      setLoading(true);
      setShippingCost(0);

      try {
        const response = await axios.post('/api/shipping/rates', {
          cart,
          destination: selectedShippingDetail,
        });

        const formattedRates =
          response.data.rates?.map((r: any) => ({
            id: r.id,
            provider: r.provider ?? '',
            servicelevel: r.servicelevel ?? '',
            amount: r.amount,
          })) ?? [];

        setRates(formattedRates);
      } catch (error) {
        console.error('Error fetching shipping rates:', error);
        setRates([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch after first mount
    if (!firstFetch.current) {
      fetchShippingRates();
    } else {
      firstFetch.current = false;
    }
  }, [cart.items, selectedShippingDetail]);

  // Open dropdown on first mount with a slight delay
  useEffect(() => {
    if (firstMount.current) {
      console.log("mounting");
      const timer = setTimeout(() => {
        setDropdownOpen(true);
      }, 100);
      firstMount.current = false;
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelectedRateId(id);
    const rate = rates.find((r) => r.id === id);
    if (rate) setShippingCost(rate.amount);
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
                loading || !selectedShippingDetail
                  ? []
                  : rates.map((r) => ({
                      id: r.id,
                      label: `${r.provider} - ${r.servicelevel} - £${r.amount}`,
                    }))
              }
              selectedItemId={selectedRateId}
              onSelect={handleSelect}
              placeholder={
                !selectedShippingDetail
                  ? 'Add a shipping address first'
                  : loading
                  ? 'Loading shipping options...'
                  : 'Select Shipping Option'
              }
              disabled={loading || !selectedShippingDetail}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingOptions;
