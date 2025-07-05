import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useCart } from '@/Contexts/Shop/Cart/CartContext';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import LegalNotice from '../LegalNotice';
import { useShipping } from '@/Contexts/Shop/Cart/ShippingContext';

interface PaymentDetailsProps {
  paymentIntentClientSecret: string;
}

const PaymentForm: React.FC<PaymentDetailsProps> = ({ paymentIntentClientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { total, hasPsyilocybinSporeSyringe } = useCart();
  const { createOrder  } = useShipping(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsProcessing(true);

    try {
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      if (pmError) {
        console.error('Payment method error:', pmError.message);
        setIsProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentClientSecret,
        { payment_method: paymentMethod.id }
      );
      if (confirmError) {
        console.error('Payment confirmation failed:', confirmError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        createOrder(paymentIntent.id, agreed);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white dark:bg-[#424549] text-black dark:text-white rounded-xl shadow-2xl flex flex-col items-start"
      >
        <h2 className="text-md font-semibold font-Poppins mb-4">Enter Card Details</h2>


        <div className="w-full border border-gray-300 p-4 rounded bg-white dark:border-black mb-6">
          <CardElement />
        </div>

        <PrimaryButton
          type="submit"
          className="w-full"
          disabled={
            !stripe ||
            isProcessing ||
            (hasPsyilocybinSporeSyringe && !agreed)
          }
        >
          {isProcessing ? 'Processing...' : 'Complete Checkout'}
        </PrimaryButton>

        {hasPsyilocybinSporeSyringe && (
          <LegalNotice agreed={agreed} onAgreeChange={setAgreed} />
        )}
      </form>
    </div>
  );
};

export default PaymentForm;
