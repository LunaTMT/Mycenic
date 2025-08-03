import React from 'react';
import { useShipping } from '@/Contexts/Profile/ShippingContext';
import { useProfile } from '@/Contexts/Profile/ProfileContext';
import ShippingAddressForm from '../Partials/ShippingAddressForm';
import AddressMap from '@/Components/Map/AddressMap';
import AddressList from './AddressList';
import AddButton from '@/Components/Buttons/AddItem';

interface Props {
  className?: string;
}

export default function ShippingDetails({ className = '' }: Props) {
  
  const { showForm, toggleShowForm, selectedAddress } = useShipping();
  

  return (
    <section
      className={`rounded-lg w-full h-full shadow-md border dark:border-white/20 border-black/20 overflow-hidden ${className}`}
      style={{ minHeight: '500px' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b dark:border-white/20 border-black/20">
        <h2 className="text-xl font-semibold text-black dark:text-white">Saved Addresses</h2>
         <AddButton onClick={toggleShowForm} isActive={showForm} />
      </div>

      {/* Main Content */}
      <div className="rounded-lg p-4 flex gap-6 h-[calc(100%-64px)]">
        {/* Address List */}
        <div className="flex flex-col w-1/2 h-full overflow-hidden">
          
          <div className="flex-shrink-0 mb-4 overflow-auto max-h-full">
            <AddressList />
          </div>

          {/* Add Address Form */}
          {showForm && (
            <div className="flex-shrink-0 rounded-lg p-4 shadow-md border dark:border-white/20 border-black/20 mt-auto">
              <ShippingAddressForm />
            </div>
          )}
        </div>

        {/* Map */}
        <div className="w-1/2 h-[300px] rounded-lg overflow-hidden border dark:border-white/20 border-black/20">
          <AddressMap address={selectedAddress} />
        </div>
      </div>
    </section>
  );
}
