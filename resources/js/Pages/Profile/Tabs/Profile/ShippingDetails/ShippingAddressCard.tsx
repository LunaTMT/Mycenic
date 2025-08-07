import React from 'react';
import { ShippingDetail } from '@/types/Shipping';

interface Props {
  detail: ShippingDetail;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ShippingAddressCard({ detail, isSelected, onSelect }: Props) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative cursor-pointer border rounded-lg p-4 flex flex-col items-start justify-start h-48
        ${detail.is_default ? 'bg-green-200 dark:bg-green-900/30' : 'bg-white dark:bg-gray-800'}
        ${isSelected ? 'ring-2 ring-green-400 dark:ring-green-300' : 'ring-0'}
        dark:border-white/20 border-black/20 shadow-sm
        hover:bg-green-200 dark:hover:bg-green-900/50
      `}
    >
        {!!detail.is_default && (
        <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
            >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        )}


      <h3 className="font-semibold text-lg mb-2 dark:text-white">{detail.full_name}</h3>
      <p className="text-sm dark:text-gray-300">{detail.address_line1}</p>
      {detail.address_line2 && <p className="text-sm dark:text-gray-300">{detail.address_line2}</p>}
      <p className="text-sm dark:text-gray-300">
        {detail.city}, {detail.state ? `${detail.state}, ` : ''}
        {detail.zip}
      </p>
      <p className="text-sm dark:text-gray-300">{detail.country}</p>
      <p className="text-sm mt-2 italic text-gray-500 dark:text-gray-400">{detail.phone}</p>
    </div>
  );
}
