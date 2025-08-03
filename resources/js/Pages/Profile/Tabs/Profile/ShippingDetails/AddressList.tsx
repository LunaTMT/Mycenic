import React from 'react';
import { useShipping } from '@/Contexts/Profile/ShippingContext';

export default function AddressList() {
  const {
    addresses,
    selectedAddress,
    hoveredId,
    setHoveredId,
    setSelectedAddress,
  } = useShipping();

  const handleSelectAddress = (addr: typeof selectedAddress) => {
    if (addr) setSelectedAddress(addr);
  };
  
  if (addresses.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">No addresses saved.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {addresses.slice(0, 3).map((addr) => {  /* <-- slice here */
        const selected = selectedAddress?.id === addr.id;
        const hovered = hoveredId === addr.id;

        return (
          <li
            key={addr.id}
            onClick={() => handleSelectAddress(addr)}
            onMouseEnter={() => setHoveredId(addr.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`relative cursor-pointer p-3 rounded-md border dark:border-white/20 border-black/20 transition ${
              selected
                ? 'bg-green-500/20 dark:bg-green-600/30'
                : hovered
                ? 'bg-green-200/10 dark:bg-green-700/20'
                : ''
            }`}
            title={selected ? 'Selected address' : 'Click to select this address'}
          >
            <p className="font-medium text-gray-800 dark:text-gray-100">
              Address #{addr.id}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {addr.address ?? ''}, {addr.city ?? ''}, {addr.zip ?? ''}
            </p>
            {addr.country && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{addr.country}</p>
            )}

            {(selected || hovered) && (
              <span className="absolute bottom-2 right-2 text-green-600 dark:text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
