import React, { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import { useReturn } from '@/Contexts/ReturnContext';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const {
    paymentIntentClientSecret,
    setPaymentIntentClientSecret,
    currentStep,
    orderId,
    selectedShippingOption,
    setHasPaid,
    hasPaid,
    handleContinue
  } = useReturn();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        const response = await axios.post(
          `/orders/${orderId}/return/create-payment-intent`,
          {
            total: selectedShippingOption?.amount,
            order_id: orderId,
          }
        );
        setPaymentIntentClientSecret(response.data.clientSecret);
      } catch (error: any) {
        console.error('Error fetching payment intent:', error);
        toast.error('Failed to prepare payment. Please try again.');
      }
    };

    if (currentStep === 3 && !paymentIntentClientSecret) {
      fetchPaymentIntent();
    }
  }, [currentStep, orderId, paymentIntentClientSecret, setPaymentIntentClientSecret]);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    if (!paymentIntentClientSecret) {
      toast.error('Payment Intent Client Secret is missing');
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card details not found');
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      paymentIntentClientSecret,
      {
        payment_method: { card: cardElement },
      }
    );

    if (error) {
      toast.error(error.message || 'Payment failed');
    } else if (paymentIntent?.status === 'succeeded') {
      toast.success('Payment succeeded!');
      setHasPaid(true);
      handleContinue();
    } else {
      toast.error('Unexpected payment status');
    }

    setLoading(false);
  };

  if (!paymentIntentClientSecret) {
    return <p>Preparing payment form...</p>;
  }

  return (
    <div className="space-y-4">
      {selectedShippingOption && (
        <div className="w-full p-4 border border-gray-300 rounded bg-white dark:border-black mb-4">
          <p className="font-semibold">Shipping Method</p>
          <p>Provider: {selectedShippingOption.provider}</p>
          <p>Service: {selectedShippingOption.service}</p>
          <p>
            Cost: {selectedShippingOption.currency === 'GBP' ? '£' : ''}
            {parseFloat(selectedShippingOption.amount).toFixed(2)}{' '}
            {selectedShippingOption.currency !== 'GBP' ? selectedShippingOption.currency : ''}
          </p>
        </div>
      )}

      <div className="w-full border border-gray-300 p-4 rounded bg-white dark:border-black mb-6">
        <CardElement />
      </div>

      <PrimaryButton onClick={handlePayment} className="w-full" disabled={loading || hasPaid}>
        {loading ? 'Processing...' : 'Pay'}
      </PrimaryButton>

    </div>
  );
}
