import React from 'react';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import ShippingAddressCard from './ShippingAddressCard';
import AddAddressCard from './AddAddressCard';
import ShippingAddressForm from '../Partials/ShippingAddressForm';
import Modal from '@/Components/Modal/Modal';

interface Props {
  className?: string;
}

export default function ShippingDetails({ className = '' }: Props) {
  const {
    shippingDetails,
    selectedShippingDetail,
    showForm,
    toggleShowForm,
  } = useShipping();

  const maxAddresses = 6;
  const addressesToShow = shippingDetails.slice(0, maxAddresses);
  const showAddCard = shippingDetails.length < maxAddresses;
  
  return (
    <section
      className={`rounded-lg w-full h-full shadow-md ${className}`}
      style={{ minHeight: '200px' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {addressesToShow.map((detail) => (
          <ShippingAddressCard
            key={detail.id}
            detail={detail}
          />
        ))}

        {showAddCard && <AddAddressCard />}
      </div>

      <Modal show={showForm} onClose={toggleShowForm} maxWidth="lg" closeable>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {selectedShippingDetail ? 'Edit Shipping Address' : 'Add Shipping Address'}
          </h2>
          <ShippingAddressForm />
        </div>
      </Modal>
    </section>
  );
}
