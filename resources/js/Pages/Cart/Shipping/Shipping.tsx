import React, { useState } from 'react';
import { ShippingProvider, useShipping } from '@/Contexts/Profile/ShippingContext';
import ShippingAddressCard from '@/Pages/Profile/Tabs/Profile/ShippingDetails/ShippingAddressCard';
import AddAddressCard from '@/Pages/Profile/Tabs/Profile/ShippingDetails/AddAddressCard';
import SectionToggle from './SectionToggle';
import AddressSelector from './AddressSelector';
import Modal from '@/Components/Modal/Modal';
import ShippingAddressForm from '@/Pages/Profile/Tabs/Profile/Partials/ShippingAddressForm';

const ShippingContent: React.FC = () => {
  const {
    shippingDetails,
    selectedShippingDetail,
    showForm,
    toggleShowForm,
  } = useShipping();


  const [topLevelDropdown, setTopLevelDropdown] = useState(false);
  return (
    <div className="space-y-4 w-full">
      <SectionToggle
        isOpen={topLevelDropdown}
        onToggle={() => setTopLevelDropdown(prev => !prev)}
      />

      {topLevelDropdown && (
        <div className="space-y-4">
          {shippingDetails.length > 0 ? (
            <AddressSelector />
          ) : (
            <AddAddressCard />
          )}

          {selectedShippingDetail && shippingDetails.length > 0 && (
            <ShippingAddressCard
              detail={selectedShippingDetail}
              disableSelectedStyles={true}
            />
          )}
        </div>
      )}

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

const Shipping: React.FC = () => (
  <ShippingProvider>
    <ShippingContent />
  </ShippingProvider>
);

export default Shipping;
