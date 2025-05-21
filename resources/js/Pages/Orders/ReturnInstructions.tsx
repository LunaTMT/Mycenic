import React, { useState, useEffect } from 'react'
import { Head, Link } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { motion } from 'framer-motion'
import Breadcrumb from '@/Components/Nav/Breadcrumb'
import StripePaymentForm from './StripePaymentForm'

interface ReturnInstructionsProps {
  auth: any
  orderId: string
  items: { id?: number; name: string; quantity: number; image?: string; price?: number }[]
  returnLabelUrl: string
  returnStatus: 'label_generated' | 'in_transit' | 'received' | 'refunded'
  supportEmail: string
}

const statusMap = {
  label_generated: 'Label Generated',
  in_transit: 'Package In Transit',
  received: 'Package Received',
  refunded: 'Refunded',
}

const shippingOptions = [
  { id: 'standard', label: 'Standard Shipping (3-5 days)', price: 3.99 },
  { id: 'express', label: 'Express Shipping (1-2 days)', price: 7.99 },
  { id: 'overnight', label: 'Overnight Shipping', price: 14.99 },
]

interface ShippingOptionProps {
  selectedOption: string
  onChange: (option: string) => void
}

const ShippingOption = ({ selectedOption, onChange }: ShippingOptionProps) => (
  <div className="mt-2 text-sm text-gray-700 dark:text-gray-400">
    <p>Please select your return shipping option:</p>
    <div className="mt-2 space-y-2">
      {shippingOptions.map(({ id, label, price }) => (
        <label key={id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="shippingOption"
            value={id}
            checked={selectedOption === id}
            onChange={() => onChange(id)}
            className="form-radio h-4 w-4 text-green-600"
          />
          <span>{label} — £{price.toFixed(2)}</span>
        </label>
      ))}
    </div>
  </div>
)

export default function ReturnInstructions(props: ReturnInstructionsProps) {
  const { orderId, items, returnLabelUrl, returnStatus, supportEmail } = props
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('') // no default selection
  const [hasContinued, setHasContinued] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(1)

  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null)

  // Find price based on selected option
  const selectedShippingPrice = shippingOptions.find(
    (option) => option.id === selectedShippingOption
  )?.price ?? 0

  const createPaymentIntent = async (amount: number) => {
    setIsCreatingIntent(true)
    try {
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({ amount: Math.round(amount * 100) }),
        credentials: 'same-origin',
      })

      const data = await response.json()
      if (response.ok && data.clientSecret) {
        setPaymentIntentClientSecret(data.clientSecret)
      } else {
        console.error('Failed to create payment intent', data)
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
    } finally {
      setIsCreatingIntent(false)
    }
  }

  useEffect(() => {
    if (currentStep === 3 && selectedShippingPrice > 0) {
      createPaymentIntent(selectedShippingPrice)
    }
  }, [currentStep, selectedShippingPrice])

  const steps = [
    {
      text: 'Before proceeding, select the item(s) you wish to return by checking the boxes above.',
      component: null,
    },
    {
      text: 'Select return shipping option',
      component: (
        <ShippingOption
          selectedOption={selectedShippingOption}
          onChange={setSelectedShippingOption}
        />
      ),
    },
    {
      text: 'Payment of shipping',
      component: (
        <>
          <p className="mb-4 font-semibold">
            Shipping Cost: £{selectedShippingPrice.toFixed(2)}
          </p>
          {paymentIntentClientSecret ? (
            <StripePaymentForm
              paymentIntentClientSecret={paymentIntentClientSecret}
              total={selectedShippingPrice}
              onSuccess={(paymentIntentId) => {
                console.log('Return shipping paid:', paymentIntentId)
                setCurrentStep(4)
              }}
            />
          ) : (
            <p>Loading payment form...</p>
          )}
        </>
      ),
    },
    {
      text: 'Print the shipping label using the button below.',
      component: null,
    },
    {
      text: 'Carefully repackage the item(s) securely.',
      component: null,
    },
    {
      text: 'Attach the label to the outside of the package.',
      component: null,
    },
    {
      text: 'Drop the package at your nearest courier location.',
      component: null,
    },
  ]

  const toggleItem = (index: number) => {
    if (hasContinued) return
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const totalSelected = selectedItems.reduce((sum, index) => {
    const item = items[index]
    return sum + (item.price ?? 0) * item.quantity
  }, 0)

  const canContinue = (step: number) => {
    switch (step) {
      case 1:
        return selectedItems.length > 0
      case 2:
        return selectedShippingOption !== ''
      case 3:
        return true
      default:
        return true
    }
  }

  const handleContinue = () => {
    if (!canContinue(currentStep)) return
    setHasContinued(true)
    setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev))
    if (currentStep === 2) setHasContinued(false)
  }

  return (
    <AuthenticatedLayout
      auth={props.auth}
      header={
        <div className="h-[5vh] z-10 w-full flex justify-between items-center">
          <Breadcrumb
            items={[
              { label: 'ACCOUNT' },
              { label: 'ORDERS', link: route('orders.index') },
              { label: `#${orderId}` },
              { label: 'RETURNS' },
            ]}
          />
        </div>
      }
    >
      <Head title="Return Instructions" />
      <div className="relative z-10 w-full max-w-7xl mx-auto dark:text-gray-300 flex gap-5 justify-center items-start font-Poppins">
        <div className="fixed inset-0 z-0 overflow-hidden bg-black">
          <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
            <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 text-gray-900 dark:text-gray-300 font-Poppins">
          <div className="w-full overflow-hidden rounded-xl shadow-lg border border-gray-300 dark:border-white/20 dark:bg-[#424549]/80">
            <table className="w-full">
              <thead className="bg-white dark:bg-[#1e2124] text-gray-900 dark:text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-center">Quantity</th>
                  <th className="px-4 py-2 text-center">Price</th>
                  <th className="px-4 py-2 text-center">Select</th>
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <motion.tr
                    key={item.id ?? index}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200 bg-white/70 dark:bg-[#424549]/20"
                  >
                    <td className="px-4 py-3 flex items-center gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      )}
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-center">£{(item.price ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(index)}
                        onChange={() => toggleItem(index)}
                        disabled={hasContinued}
                        className="form-checkbox h-5 w-5 text-green-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      £{((item.price ?? 0) * item.quantity).toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 flex justify-between items-center font-semibold text-lg border-t border-gray-300 dark:border-white/20">
              <span>Total Selected:</span>
              <span>£{totalSelected.toFixed(2)}</span>
            </div>
          </div>

          {/* Step instructions */}
          <section className="my-8 rounded-lg bg-white/90 dark:bg-[#1e2124]/90 p-6 shadow-lg">
            <p className="mb-4 font-semibold text-lg text-green-600">
              Step {currentStep} of {steps.length}
            </p>
            <p className="mb-4">{steps[currentStep - 1].text}</p>
            {steps[currentStep - 1].component}

            <div className="mt-6 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-md bg-gray-300 hover:bg-gray-400 px-4 py-2 font-semibold dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
              )}
              {currentStep < steps.length && (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!canContinue(currentStep)}
                  className={`rounded-md px-4 py-2 font-semibold ${
                    canContinue(currentStep)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              )}
              {currentStep === steps.length && (
                <a
                  href={returnLabelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                >
                  Print Return Label
                </a>
              )}
            </div>
          </section>

          <section className="mt-12 max-w-xl mx-auto rounded-lg bg-white/90 dark:bg-[#1e2124]/90 p-6 text-gray-700 dark:text-gray-300">
            <h3 className="font-semibold text-xl mb-4">Return Status</h3>
            <p>Status: <span className="font-bold">{statusMap[returnStatus] || 'Unknown'}</span></p>
            <p className="mt-2">
              If you have any questions or need assistance, please contact our support team at{' '}
              <a href={`mailto:${supportEmail}`} className="text-green-600 hover:underline">
                {supportEmail}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
