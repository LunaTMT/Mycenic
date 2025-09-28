import React from 'react';
import { useShipping } from '@/Contexts/User/ShippingContext';
import ShippingAddressCard from './AddressCard';
import AddAddressCard from './AddAddressCard';
import AddressForm from '../Partials/AddressForm';
import Modal from '@/Components/Modal/Modal';

interface Props {
  className?: string;
}

export default function ShippingDetails({ className = '' }: Props) {
  const {
    addresses,
    selectedAddress,
    showForm,
    toggleShowForm,
  } = useShipping();
  console.log("shippingDetails :", addresses);
  const maxAddresses = 6;
  const addressesToShow = addresses.slice(0, maxAddresses);
  const showAddCard = addresses.length < maxAddresses;
  
  return (
    <section
      className={`rounded-lg w-full h-full shadow-md ${className}`}
      style={{ minHeight: '200px' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {addressesToShow.map((address) => (
          <ShippingAddressCard
            key={address.id}
            address={address}
          />
        ))}

        {showAddCard && <AddAddressCard />}
      </div>

      <Modal show={showForm} onClose={toggleShowForm} maxWidth="lg" closeable>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            {selectedAddress ? 'Edit Shipping Address' : 'Add Shipping Address'}
          </h2>
          <AddressForm />
        </div>
      </Modal>
    </section>
  );
}
