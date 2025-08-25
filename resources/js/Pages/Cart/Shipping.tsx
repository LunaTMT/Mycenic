import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowIcon from '@/Components/Icon/ArrowIcon';
import Modal from '@/Components/Modal/Modal';
import ShippingDetailsForm from './ShippingForm';


const Shipping: React.FC = () => {
  const [shippingDetailsSet, setShippingDetailsSet] = React.useState(false); // Tracks whether shipping details are set
  const [isDropdownOpen, setDropdownOpen] = React.useState(false); // Tracks dropdown open state
  const [isModalOpen, setModalOpen] = React.useState(false); // Tracks modal open state

  const toggleDropdown = useCallback(() => {
    if (!shippingDetailsSet) {
      setModalOpen(true); // Open the modal if shipping details are not set
      setDropdownOpen(false);
    } else {
      setDropdownOpen((prev) => !prev); // Toggle dropdown if shipping details are set
    }
  }, [shippingDetailsSet]);

  const closeModal = useCallback(() => {
    setModalOpen(false); // Close the modal when the user cancels or saves the form
  }, []);

  return (
    <div>
      <button
        onClick={toggleDropdown}
        className="w-full text-sm mb-2 text-left font-semibold text-gray-800 dark:text-gray-200 flex justify-between"
      >
        Estimated Shipping <ArrowIcon w="24" h="24" isOpen={isDropdownOpen} />
      </button>

      <AnimatePresence initial={false}>
        {isDropdownOpen && (
          <motion.div
            key="shippingDropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="p-4 rounded-md border border-gray-300 dark:border-gray-600"
          >
            <p className="text-gray-700 dark:text-gray-300">
              Estimated shipping info shown here.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal show={isModalOpen} onClose={closeModal} maxWidth="sm" closeable>
        <ShippingDetailsForm
          onClose={closeModal}
          setShippingDetailsSet={setShippingDetailsSet} // Pass down the function to update shipping details state
        />
      </Modal>
    </div>
  );
};

export default Shipping;
