import React, { isValidElement, ReactElement } from 'react'
import { useReturn } from '@/Contexts/ReturnContext'
import { ShippingOption } from './Test/ShippingOption'
import PaymentPage from './Test/PaymentPage'

interface Step {
  text: string
  component: React.ReactNode | null
}

export default function StepNavigator() {
  const {
    currentStep, // number, 1-based index
    handlePrevious,
    handleContinue,

    paymentIntentClientSecret,
   
    setPaymentIntentClientSecret,
  } = useReturn()

  const steps: Step[] = [
    {
      text: 'Before proceeding, select the item(s) you wish to return by checking the box above and selecting the quantity.',
      component: null,
    },
    {
      text: 'Select return shipping option',
      component: <ShippingOption />,
    },
    {
      text: 'Payment of shipping',
      component: paymentIntentClientSecret ? (
        <PaymentPage
          paymentIntentClientSecret={paymentIntentClientSecret}
          total={0}
          onSuccess={setPaymentIntentClientSecret}
        />
      ) : (
        <p>Loading payment form…</p>
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

  const total = steps.length
  // get current step object by adjusting for 1-based index
  const step = steps[currentStep - 1]

  // Replace this with your real validation logic
  function canContinue(step: Step) {
    return step.text.trim().length > 0
  }

  const disabled = !canContinue(step)

  const renderedComponent = isValidElement(step.component)
    ? React.cloneElement(step.component as ReactElement, { isActive: true })
    : step.component

  return (
    <div className="rounded-lg bg-white dark:bg-[#1e2124] p-6 shadow-lg">
      <p className="mb-4 font-semibold text-lg text-green-600">
        Step {currentStep} of {total}
      </p>

      <p className="mb-4">{step.text}</p>

      <div>{renderedComponent}</div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`rounded-md px-5 py-2 font-semibold transition-colors duration-200 ${
            currentStep === 1
              ? 'bg-blue-200 text-blue-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Previous
        </button>
        <button
          onClick={handleContinue}
          disabled={disabled}
          className={`rounded-md px-6 py-2 font-semibold transition-colors duration-200 ${
            disabled
              ? 'bg-green-300 text-green-700 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
          }`}
        >
          {currentStep === total ? 'Finish' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
