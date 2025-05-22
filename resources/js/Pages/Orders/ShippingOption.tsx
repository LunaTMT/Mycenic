import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface ShippingOptionData {
  id: string
  label: string
  price: number | string // Accepting string too, just in case API sends price as string
}

interface Address {
  street1: string
  city: string
  zip: string
  country: string
}

interface ShippingOptionProps {
  selectedOption: string
  onChange: (option: string) => void
  fromAddress: Address
  totalWeight: number // in kilograms or grams, depending on backend
  orderId: string | number
}

export const ShippingOption = ({
  selectedOption,
  onChange,
  fromAddress,
  totalWeight,
  orderId,
}: ShippingOptionProps) => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShippingOptions = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.post(`/shipping/return-${orderId}-options`, {
          from: fromAddress,
          weight: totalWeight,
        })
        console.log(response)

        setShippingOptions(response.data.options)
      } catch (err) {
        console.error(err)
        setError('Failed to load shipping options.')
      } finally {
        setLoading(false)
      }
    }

    fetchShippingOptions()
  }, [fromAddress, totalWeight, orderId])

  return (
    <div className="mt-2 text-sm text-gray-700 dark:text-gray-400">
      <p>Please select your return shipping option:</p>

      {loading && <p className="mt-2 text-blue-500">Loading shipping options...</p>}
      {error && <p className="mt-2 text-red-500">{error}</p>}

      {!loading && !error && (
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
                {label} — £{!isNaN(Number(price)) ? Number(price).toFixed(2) : '0.00'}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
