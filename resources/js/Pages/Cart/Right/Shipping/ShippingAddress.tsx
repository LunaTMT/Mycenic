import React, { useState, useEffect, useRef } from 'react';
import { useShipping } from '@/Contexts/User/ShippingContext';
import ShippingAddressCard from '@/Pages/Profile/Tabs/Profile/Shipping/AddressCard';
import AddAddressCard from '@/Pages/Profile/Tabs/Profile/Shipping/AddAddressCard';
import AddressSelector from './AddressSelector';
import Modal from '@/Components/Modal/Modal';
import AddressForm from '@/Pages/Profile/Tabs/Profile/Partials/AddressForm';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowIcon from '@/Components/Icon/ArrowIcon';

const ShippingAddress: React.FC = () => {
  const {
    addresses,
    selectedAddress,
    showForm,
    toggleShowForm,
  } = useShipping();

  const [topLevelDropdown, setTopLevelDropdown] = useState(false);

  // Ref to track if this is the first mount
  const firstMount = useRef(true);

  // Open dropdown on first mount
  useEffect(() => {
    if (firstMount.current) {
      const timer = setTimeout(() => {
        setTopLevelDropdown(true);
      }, 100); // 100ms delay before opening the dropdown
      firstMount.current = false;
      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, []); // This runs only once on first mount

  console.log(addresses);

  const handleToggleDropdown = () => {
    setTopLevelDropdown(prev => !prev);
  };

  return (
    <div className="space-y-4 w-full">
      <button
        onClick={handleToggleDropdown}
        className="w-full text-sm mb-2 text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
      >
        Shipping Address
        <ArrowIcon w="24" h="24" isOpen={topLevelDropdown} />
      </button>

      <AnimatePresence>
        {topLevelDropdown && (
          <motion.div
            key="shippingDropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="space-y-4 "
          >
            {addresses.length > 0 ? <AddressSelector /> : <AddAddressCard />}

            {selectedAddress && addresses.length > 0 && (
              <ShippingAddressCard
                address={selectedAddress}
                disableSelectedStyles={true}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal show={showForm} onClose={toggleShowForm} maxWidth="lg" closeable>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {selectedAddress ? 'Edit Shipping Address' : 'Add Shipping Address'}
          </h2>
          <AddressForm />
        </div>
      </Modal>
    </div>
  );
};

export default ShippingAddress;
