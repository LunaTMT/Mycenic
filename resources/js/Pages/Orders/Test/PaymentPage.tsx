import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

interface PaymentPageProps {

}

export default function PaymentPage({ }: PaymentPageProps) {
  const options = {

    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className='w-1/2'>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm  />
      </Elements>
    </div>
  );
}



