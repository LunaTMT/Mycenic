import React, { useState } from 'react';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import ShippingAddressCard from './ShippingAddressCard';
import AddAddressCard from './AddAddressCard';
import ShippingAddressForm from '../Partials/ShippingAddressForm';
import Modal from '@/Components/Login/Modal';

interface Props {
  className?: string;
}

export default function ShippingDetails({ className = '' }: Props) {
  const {
    shippingDetails,
    selectedShippingDetail,
    setDefaultShippingDetail,
  } = useShipping();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const maxAddresses = 6;
  const showAddCard = shippingDetails.length < maxAddresses;
  const addressesToShow = shippingDetails.slice(0, maxAddresses);

  return (
    <section
      className={`rounded-lg w-full h-full shadow-md ${className}`}
      style={{ minHeight: '200px' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {addressesToShow.length ? (
          addressesToShow.map((detail) => (
            <ShippingAddressCard
              key={detail.id}
              detail={detail}
              isSelected={selectedShippingDetail?.id === detail.id}
              onSelect={() => setDefaultShippingDetail(detail)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 col-span-3">
            No saved addresses.
          </p>
        )}

        {showAddCard && <AddAddressCard onClick={() => setIsModalOpen(true)} />}
      </div>

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="lg" closeable>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Add Shipping Address</h2>
          <ShippingAddressForm closeModal={() => setIsModalOpen(false)} />
        </div>
      </Modal>
    </section>
  );
}
