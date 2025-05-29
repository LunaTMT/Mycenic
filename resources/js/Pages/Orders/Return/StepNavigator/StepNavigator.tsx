import React, { isValidElement, ReactElement, useState } from 'react'
import { useReturn } from '@/Contexts/ReturnContext'
import { ShippingOption } from './Steps/ShippingOption'
import PaymentPage from './PaymentPage'

import { ShippingLabelFetcher } from './Steps/ShippingLabelFetcher'

interface Step {
  text: string
  component: React.ReactNode | null
}

export default function StepNavigator() {
  const {
    currentStep,
    handlePrevious,
    handleContinue,
    handleFinish,
    selectedItems,
    selectedShippingOption,
    hasPaid,
    shippingLabelUrl
  } = useReturn()



const steps: Step[] = [
  {
      text: 'Before proceeding, select the item(s) you wish to return by checking the box above and selecting the quantity.',
      component: null,
    },
    {
      text: 'Select a return shipping option.',
      component: <ShippingOption />,
    },
    {
      text: 'Make the payment for the shipping.',
      component: <PaymentPage />,
    },
    {
      text: 'Print the shipping label using the button below.',
      component: <ShippingLabelFetcher />,
    },
    {
      text: 'Carefully repackage the item(s), attach the shipping label, and drop the package at your nearest courier location.',
      component: null,
    },
  ]


  const total = steps.length
  const step = steps[currentStep - 1]

  function canContinue(step: Step): boolean {
    if (currentStep === 1) {
      return selectedItems.length > 0
    }

    if (currentStep === 2) {
      return !!selectedShippingOption
    }

    if (currentStep === 3) {
      return hasPaid
    }

    if (currentStep === 4) {
      console.log(!!shippingLabelUrl)
      return !!shippingLabelUrl
    }

    return true
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
          className={`rounded-lg px-6 py-2 font-medium transition-all duration-200 shadow-sm
            ${
              currentStep === 1
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            }
          `}
        >
          Previous
        </button>

        <button
          onClick={currentStep === total ? handleFinish : handleContinue}
          disabled={disabled}
          className={`rounded-lg px-6 py-2 font-medium transition-all duration-200 shadow-sm
            ${
              disabled
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
            }
          `}
        >
          {currentStep === total ? 'Finish' : 'Continue'}
        </button>

      </div>
    </div>
  )
}
