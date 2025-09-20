import React, { useState } from 'react'
import axios from 'axios'
import { useReturn } from '@/Contexts/Orders/ReturnInstructionContext'

export function ShippingLabelFetcher() {
  const {
    selectedShippingOption,
    setShippingLabelUrl,
    shippingLabelUrl,
  } = useReturn()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchShippingLabel = async () => {
    if (!selectedShippingOption?.object_id) {
      setError('No shipping rate selected')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      console.log("test ", selectedShippingOption);
      const response = await axios.post(
        '/shipping/purchase',
        { rate_id: selectedShippingOption.object_id },
        { withCredentials: true }
      )

      const { status, data, message } = response.data

      if (status === 'success') {
        const labelUrl = data?.label_url || data?.url || null
        setShippingLabelUrl(labelUrl)

        if (labelUrl) {
          openAndPrintLabel(labelUrl)
        }
      } else {
        setError(message || 'Failed to purchase shipping label')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Network error while purchasing label'
      )
    } finally {
      setLoading(false)
    }
  }

  const openAndPrintLabel = (url: string) => {
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
      }
    } else {
      alert('Pop-up blocked! Please allow pop-ups for this site to print the label.')
    }
  }

  return (
    <div>
      {shippingLabelUrl ? (
        <button
          onClick={() => openAndPrintLabel(shippingLabelUrl)}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Print Shipping Label
        </button>
      ) : (
        <button
          onClick={fetchShippingLabel}
          disabled={loading || !selectedShippingOption}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Fetching Label...' : 'Get Shipping Label'}
        </button>
      )}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  )
}
