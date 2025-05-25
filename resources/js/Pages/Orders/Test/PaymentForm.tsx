import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';

export default function PaymentForm({
  paymentIntentClientSecret,
  total,
  onSuccess,
}: {
  paymentIntentClientSecret: string;
  total: number;
  onSuccess: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    const result = await stripe.confirmCardPayment(paymentIntentClientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      console.error(result.error.message);
      alert(result.error.message);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      onSuccess(result.paymentIntent.id);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="border p-4 rounded bg-white dark:bg-[#2c2f33]">
        <CardElement />
      </div>
      <PrimaryButton onClick={handlePayment} className="w-full" disabled={loading}>
        {loading ? 'Processing...' : `Pay £${total.toFixed(2)}`}
      </PrimaryButton>
    </div>
  );
}
