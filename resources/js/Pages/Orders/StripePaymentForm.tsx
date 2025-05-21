import React, { useEffect, useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

interface StripePaymentFormProps {
  paymentIntentClientSecret: string
  total: number
  onSuccess: (paymentIntentId: string) => void
}

export default function StripePaymentForm({
  paymentIntentClientSecret,
  total,
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!stripe || !paymentIntentClientSecret) return

    const checkPaymentStatus = async () => {
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(paymentIntentClientSecret)

      if (error) {
        setMessage(error.message ?? 'Failed to retrieve payment status.')
        return
      }

      if (!paymentIntent) {
        setMessage(null)
        return
      }

      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!')
          onSuccess(paymentIntent.id)
          break
        case 'processing':
          setMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setMessage('Payment failed, please try another payment method.')
          break
        default:
          setMessage(null)
          break
      }
    }

    checkPaymentStatus()
  }, [stripe, paymentIntentClientSecret, onSuccess])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return to the current page after payment confirmation
        return_url: window.location.href,
      },
      redirect: 'if_required',
    })

    if (error) {
      setMessage(error.message ?? 'An unexpected error occurred during payment.')
    }

    setIsProcessing(false)
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement id="payment-element" />
      {message && <div className="text-red-600">{message}</div>}
      <button
        id="submit"
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : `Pay £${total.toFixed(2)}`}
      </button>
    </form>
  )
}
