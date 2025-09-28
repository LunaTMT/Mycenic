import React from 'react';
import { useShipping } from '@/Contexts/User/ShippingContext';

interface Props {
  className?: string;
}

export default function AddAddressCard({ className = '' }: Props) {
  const { setSelectedAddress, toggleShowForm } = useShipping();

  const handleClick = () => {
    setSelectedAddress(null); // clear any selected address
    toggleShowForm(); // open modal to add new address
  };

  return (
    <div
      onClick={handleClick}
      className={`
        cursor-pointer
        border-2 border-dashed border-black/20 dark:border-white/20
        bg-white dark:bg-[#1e2124]/60
        rounded-lg
        flex items-center justify-center
        h-48
        text-gray-900 dark:text-gray-100
        hover:border-green-400 hover:text-green-400
        transition-colors duration-300
        ${className}
      `}
    >
      <span className="text-lg select-none">+ Add Address</span>
    </div>
  );
}
