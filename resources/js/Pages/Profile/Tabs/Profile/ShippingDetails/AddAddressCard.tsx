import React from 'react';

interface Props {
  onClick: () => void;
}

export default function AddAddressCard({ onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg flex items-center justify-center h-48 text-gray-500 dark:text-gray-400 hover:border-green-400 hover:text-green-400 transition"
    >
      <span className="text-lg font-semibold select-none">+ Add Address</span>
    </div>
  );
}
