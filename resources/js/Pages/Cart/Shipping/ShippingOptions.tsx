import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchShippingRates = async () => {
      if (!cart.items.length || !selectedShippingDetail) return;

      setLoading(true);

      try {
        console.log("fetching shipping rates");
        setShippingCost(0);
        const response = await axios.post('/api/shipping/rates', {
          cart,
          destination: selectedShippingDetail,
        });
        console.log(response);
        const formattedRates = response.data.rates?.map((r: any) => ({
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

    fetchShippingRates();
  }, [cart.items, selectedShippingDetail]);

  const handleSelect = (id: string) => {
    setSelectedRateId(id);
    const rate = rates.find(r => r.id === id);
    if (rate) setShippingCost(rate.amount);
  };

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

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
              items={loading
                ? []
                : rates.map(r => ({
                    id: r.id,
                    label: `${r.provider} - ${r.servicelevel} - £${r.amount}`,
                  }))}
              selectedItemId={selectedRateId}
              onSelect={handleSelect}
              placeholder={loading ? 'Loading shipping options...' : 'Select Shipping Option'}
              disabled={loading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingOptions;
