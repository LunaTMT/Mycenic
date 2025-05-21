import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { router, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/Buttons/PrimaryButton';
import { useCart } from '@/Contexts/CartContext';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import Breadcrumb from '@/Components/Nav/Breadcrumb';
import LegalNotice from '../../LegalNotice';

interface PaymentDetailsProps {
  paymentIntentClientSecret: string;
}

const PaymentForm: React.FC<PaymentDetailsProps> = ({ paymentIntentClientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { createOrder, total, hasPsyilocybinSporeSyringe } = useCart();
  const { auth } = usePage().props as { auth: { user: any } };

  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

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
        createOrder(paymentIntent.id, agreed); // Pass `legalAgreement` here
      }
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <Layout
      header={
        <div className="h-[5vh] z-10 w-full flex justify-between items-center gap-4">
          <Breadcrumb
            items={[
              { label: 'CART', link: route('cart') },
              { label: 'PAYMENT' },
            ]}
          />
        </div>
      }
    >
      <div className="relative w-full h-[89vh] flex justify-center items-center">
        {/* Video background */}
        <video
          src="/assets/videos/time_lapse.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
        </video>

        {/* Payment form */}
        <form
          onSubmit={handleSubmit}
          className="relative z-20 w-full max-w-lg bg-white dark:bg-[#424549] text-black dark:text-white rounded-xl shadow-2xl p-8 flex flex-col items-start"
        >
          <h2 className="text-2xl font-bold font-Poppins mb-4">ENTER CARD DETAILS</h2>

          <div className="w-full text-lg font-semibold mb-6">
            Total: £{(parseFloat(total) || 0).toFixed(2)}
          </div>

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

          {/* Show LegalNotice only if needed */}
          {hasPsyilocybinSporeSyringe && (
            <LegalNotice agreed={agreed} onAgreeChange={setAgreed} />
          )}
        </form>
      </div>
    </Layout>
  );
};

export default PaymentForm;
