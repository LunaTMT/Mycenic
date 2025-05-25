import React, { useEffect } from 'react'
import { useReturn } from '@/Contexts/ReturnContext'

export const ShippingOption = () => {
  const {
    shippingOptions,
    selectedShippingOption,
    chooseShippingOption,
    currentStep,
    orderId,
    fetchShippingOptions,
  } = useReturn()

  useEffect(() => {
    console.log(currentStep);
    if (currentStep === 2 ) {
      console.log("getting shipping");
      fetchShippingOptions()
    }
  }, [currentStep, orderId, ])

  // If not on step 2 or shippingOptions not ready, don't render options
  if (currentStep !== 2) {
    return null
  }
  console.log(shippingOptions)

  return (
    <div className="mt-2 text-sm">
      <p>Please select your return shipping option:</p>
      <div className="mt-2 space-y-2">
        {(shippingOptions || []).map(({ object_id, provider, service, amount, currency }) => (
          <label key={object_id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="shippingOption"
              value={object_id}
              checked={selectedShippingOption === object_id}
              onChange={() => chooseShippingOption(object_id)}
              className="form-radio h-4 w-4 text-green-600"
            />
            <span>
              {provider} {service} — £{parseFloat(amount).toFixed(2)} {currency}
            </span>
          </label>
        ))}

      </div>
    </div>
  )
}
