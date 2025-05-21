Oimport React from 'react'

interface ShippingOptionProps {
  selectedOption: string
  onChange: (option: string) => void
}

const shippingOptions = [
  { id: 'standard', label: 'Standard Shipping (3-5 days)', price: 3.99 },
  { id: 'express', label: 'Express Shipping (1-2 days)', price: 7.99 },
  { id: 'overnight', label: 'Overnight Shipping', price: 14.99 },
]

export const ShippingOption = ({ selectedOption, onChange }: ShippingOptionProps) => {
  return (
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
            <span>
              {label} — £{price.toFixed(2)}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
