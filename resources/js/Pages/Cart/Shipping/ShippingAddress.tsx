import React, { useState, useEffect } from 'react';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import ShippingAddressCard from '@/Pages/Profile/Tabs/Profile/ShippingDetails/ShippingAddressCard';
import AddAddressCard from '@/Pages/Profile/Tabs/Profile/ShippingDetails/AddAddressCard';
import AddressSelector from './AddressSelector';
import Modal from '@/Components/Modal/Modal';
import ShippingAddressForm from '@/Pages/Profile/Tabs/Profile/Partials/ShippingAddressForm';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowIcon from '@/Components/Icon/ArrowIcon';

const ShippingAddress: React.FC = () => {
  const {
    shippingDetails,
    selectedShippingDetail,
    showForm,
    toggleShowForm,
    fetchShippingDetails,
  } = useShipping();

  const [topLevelDropdown, setTopLevelDropdown] = useState(false);

  useEffect(() => {
    fetchShippingDetails();
  }, []);

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

      <AnimatePresence initial={false}>
        {topLevelDropdown && (
          <motion.div
            key="shippingDropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="space-y-4"
          >
            {shippingDetails.length > 0 ? <AddressSelector /> : <AddAddressCard />}

            {selectedShippingDetail && shippingDetails.length > 0 && (
              <ShippingAddressCard detail={selectedShippingDetail} disableSelectedStyles={true} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal show={showForm} onClose={toggleShowForm} maxWidth="lg" closeable>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {selectedShippingDetail ? 'Edit Shipping Address' : 'Add Shipping Address'}
          </h2>
          <ShippingAddressForm />
        </div>
      </Modal>
    </div>
  );
};

export default ShippingAddress;
