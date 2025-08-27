import React from 'react';
import { useShipping } from '@/Contexts/Profile/ShippingContext';

interface Props {
  className?: string;
}

export default function AddAddressCard({ className = '' }: Props) {
  const { setSelectedShippingDetail, toggleShowForm } = useShipping();

  const handleClick = () => {
    setSelectedShippingDetail(null); // clear any selected address
    toggleShowForm(); // open modal to add new address
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center h-48 text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-400 transition ${className}`}
    >
      <span className="text-lg font-semibold select-none">+ Add Address</span>
    </div>
  );
}
