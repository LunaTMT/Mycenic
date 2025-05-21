import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

interface PaymentPageProps {
  paymentIntentClientSecret: string;
}

export default function PaymentPage({ paymentIntentClientSecret }: PaymentPageProps) {
  const options = {
    clientSecret: paymentIntentClientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm paymentIntentClientSecret={paymentIntentClientSecret} />
    </Elements>
  );
}
