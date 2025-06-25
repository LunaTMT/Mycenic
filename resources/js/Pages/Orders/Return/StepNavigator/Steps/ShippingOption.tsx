import React, { useEffect } from 'react'
import { useReturn } from '@/Contexts/Orders/ReturnInstructionContext'

export const ShippingOption = () => {
  const {
    shippingOptions,
    selectedShippingOption,
    setSelectedShippingOption,
    currentStep,
    orderId,
    fetchShippingOptions,
  } = useReturn()

  useEffect(() => {
    if (currentStep === 2 && !selectedShippingOption) {
      fetchShippingOptions()
    }
  }, [currentStep, orderId, selectedShippingOption])

  useEffect(() => {
    if (currentStep === 2 && shippingOptions.length > 0 && !selectedShippingOption) {
      const cheapestOption = shippingOptions.reduce((prev, curr) =>
        parseFloat(curr.amount) < parseFloat(prev.amount) ? curr : prev
      , shippingOptions[0])

      setSelectedShippingOption(cheapestOption)
      
    }
  }, [currentStep, shippingOptions, selectedShippingOption])

  if (currentStep !== 2 || shippingOptions.length === 0) {
    return null
  }
 
  const handleShippingOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    const selected = shippingOptions.find(option => option.object_id === selectedId) || null
    setSelectedShippingOption(selected)
    console.log(selected)
  }

  return (
    <div className="mt-2 text-sm">
      <p>Please select your return shipping option:</p>
      <div className="mt-2">
        <select
          id="shipping-option"
          className="w-full p-2 border border-gray-300 dark:border-white/30 rounded bg-white dark:bg-[#2c2f33] dark:text-white"
          onChange={handleShippingOptionChange}
          value={selectedShippingOption?.object_id || ''}
        >
          {shippingOptions.map(({ object_id, provider, service, amount }) => (
            <option key={object_id} value={object_id}>
              {provider} {service} — £{parseFloat(amount).toFixed(2)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
