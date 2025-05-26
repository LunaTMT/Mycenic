import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useReturn } from '@/Contexts/ReturnContext'

export function ShippingLabelFetcher() {
  const { selectedShippingOption, currentStep } = useReturn()

  const [labelUrl, setLabelUrl] = useState<string | null>(null)
  const [loadingLabel, setLoadingLabel] = useState(false)
  const [error, setError] = useState<string | null>(null)

    const fetchShippingLabel = async () => {

    console.log("getting shipping label")
  

    if (!selectedShippingOption?.object_id) {
        setError('No shipping rate selected')
        return
    }

 
    setLoadingLabel(true)
    setError(null)

    try {
        const response = await axios.post('/shipping/purchase', {
        rate_id: selectedShippingOption?.object_id,
        }, {
        withCredentials: true,
        })


        console.log("response:", response)
        const data = response.data.data
        console.log("data: ", data)

        if (data.status === 'success') {
        setLabelUrl(data.data?.label_url || data.data?.url || null)
        } else {
        setError(data.message || 'Failed to purchase shipping label')
        }
    } catch (err: any) {
        setError(
        err.response?.data?.message || 'Network error while purchasing label'
        )
    } finally {
        setLoadingLabel(false)
    }
    }


  useEffect(() => {
    if (currentStep === 4 && !labelUrl) {
      fetchShippingLabel()
    }
  }, [currentStep, labelUrl])

  return (
    <div>
      <button
        disabled={loadingLabel || !selectedShippingOption}
        onClick={fetchShippingLabel}
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loadingLabel ? 'Fetching Label...' : 'Get Shipping Label'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {labelUrl && (
        <div className="mt-4">
          <a href={labelUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
            Open Shipping Label
          </a>
        </div>
      )}
    </div>
  )
}
