import React from 'react';
import { Address } from '@/types/types';

interface AddressMapProps {
  address: Address | null;
}

export default function AddressMap({ address }: AddressMapProps) {
  if (!address) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
        No address selected
      </div>
    );
  }

  const mapQuery = encodeURIComponent(
    `${address.address}, ${address.city}, ${address.zip}${address.country ? ', ' + address.country : ''}`
  );

  return (
    <iframe
      title="Selected Address Map"
      src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
      width="100%"
      height="100%"
      loading="lazy"
      style={{ border: 0 }}
    />
  );
}
