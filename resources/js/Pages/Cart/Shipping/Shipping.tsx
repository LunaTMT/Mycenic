import React from 'react';
import { ShippingProvider } from '@/Contexts/Profile/ShippingContext';
import ShippingAddress from './ShippingAddress';
import ShippingOptions from './ShippingOptions';

const Shipping: React.FC = () => (
  <ShippingProvider>
    <div className="space-y-6">
      <ShippingAddress />
      <ShippingOptions />
    </div>
  </ShippingProvider>
);

export default Shipping;
