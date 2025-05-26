import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  ReactNode,
} from 'react'
import axios from 'axios'

export type ReturnItem = {
  id?: number
  name: string
  quantity: number
  image?: string
  weight?: number
  price: number
}

interface ShippingOptionData {
  object_id: string
  provider: string
  service: string
  amount: string // you can parse it to a number if needed
  currency: string
  rateId?: string // add rateId if you have it for label purchase
}
interface Step {
  text: string
  component: React.ReactNode
}

interface ReturnContextType {
  items: ReturnItem[]
  selectedItems: number[]
  returnQuantities: number[]

  shippingOptions: ShippingOptionData[]
  shippingLoading: boolean
  shippingError: string | null
  selectedShippingOption: ShippingOptionData | null

  grandTotal: number

  paymentIntentClientSecret: string | null
  hasPaid: boolean

  orderId: string | number | null
  fromAddress: any
  finishLabel: string

  shippingLabelUrl: string | null

  currentStep: number
  steps: Step[]

  changeStep: (newStep: number) => void
  handlePrevious: () => void
  handleContinue: () => void

  toggleItem: (index: number) => void
  updateQuantity: (index: number, qty: number) => void
  fetchShippingOptions: () => Promise<void>
  fetchShippingLabel: () => Promise<void>

  setPaymentIntentClientSecret: (secret: string | null) => void
  setHasPaid: (paid: boolean) => void

  setOrderId: (id: string | number | null) => void
  setFromAddress: (addr: any) => void
  setFinishLabel: (label: string) => void
  setSelectedShippingOption: (option: ShippingOptionData | null) => void
}

const ReturnContext = createContext<ReturnContextType | undefined>(undefined)

export const ReturnProvider = ({
  children,
  initialItems,
  orderID,
  returnLabelUrl,
}: {
  children: ReactNode
  initialItems: ReturnItem[]
  orderID: string | number
  returnLabelUrl: string
}) => {
  const [items] = useState(initialItems)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [returnQuantities, setReturnQuantities] = useState<number[]>(
    initialItems.map(() => 1)
  )

  const [currentStep, setCurrentStep] = useState<number>(1)

  const [shippingOptions, setShippingOptions] = useState<ShippingOptionData[]>([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOptionData | null>(null)

  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null)
  const [hasPaid, setHasPaid] = useState(true) //change to false

  const [orderId, setOrderId] = useState<string | number | null>(orderID)
  const [fromAddress, setFromAddress] = useState<any>(null)
  const [finishLabel, setFinishLabel] = useState<string>('Finish')

  const [shippingLabelUrl, setShippingLabelUrl] = useState<string | null>(returnLabelUrl || null)

  const grandTotal = useMemo(() => {
    const itemTotal = selectedItems.reduce((sum, idx) => {
      const itemPrice = items[idx].price ?? 0
      const qty = returnQuantities[idx]
      return sum + itemPrice * qty
    }, 0)

    return itemTotal
  }, [selectedItems, returnQuantities, items, selectedShippingOption])

  const toggleItem = (idx: number) => {
    setSelectedItems((prev) => {
      const isSelected = prev.includes(idx)
      return isSelected ? prev.filter((i) => i !== idx) : [...prev, idx]
    })

    setReturnQuantities((prev) => {
      const copy = [...prev]
      copy[idx] = selectedItems.includes(idx) ? 0 : 1
      return copy
    })
  }

  const updateQuantity = (idx: number, qty: number) => {
    setReturnQuantities((prev) => {
      const copy = [...prev]
      copy[idx] = qty
      return copy
    })
  }

  const fetchShippingOptions = async () => {
    setShippingLoading(true)
    setShippingError(null)
    try {
      const resp = await axios.post<ShippingOptionData[]>(
        `/orders/${orderId}/return/fetch-return-options`,
      )
      setShippingOptions(resp.data)
    } catch (err) {
      setShippingError('Failed to load shipping options.')
    } finally {
      setShippingLoading(false)
    }
  }

  // New function to fetch shipping label URL from backend
  const fetchShippingLabel = async () => {
    if (!orderId || !selectedShippingOption) return

    try {
      const response = await axios.post(`/orders/${orderId}/return/create-shipping-label`, {
        rateId: selectedShippingOption.rateId,
      })
      setShippingLabelUrl(response.data.labelUrl)
    } catch (error) {
      console.error('Failed to get shipping label:', error)
      alert('Failed to retrieve shipping label, please try again.')
    }
  }

  // Optionally fetch label automatically after payment
  useEffect(() => {
    if (hasPaid) {
      fetchShippingLabel()
    }
  }, [hasPaid])

  const totalSteps = 4
  const steps: Step[] = [] // populate as needed

  const changeStep = (newStep: number) => {
    if (newStep >= 1 && newStep <= totalSteps) {
      setCurrentStep(newStep)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      changeStep(currentStep - 1)
    }
  }

  const handleContinue = () => {
    if (currentStep < totalSteps) {
      changeStep(currentStep + 1)
    }
  }

  return (
    <ReturnContext.Provider
      value={{
        items,
        selectedItems,
        returnQuantities,
        shippingOptions,
        shippingLoading,
        shippingError,
        selectedShippingOption,

        grandTotal,
        paymentIntentClientSecret,
        orderId,
        fromAddress,
        finishLabel,

        hasPaid,
        setHasPaid,

        shippingLabelUrl,

        toggleItem,
        updateQuantity,
        fetchShippingOptions,
        fetchShippingLabel,

        setPaymentIntentClientSecret,
        setOrderId,
        setFromAddress,
        setFinishLabel,
        setSelectedShippingOption,

        currentStep,
        steps,
        changeStep,
        handlePrevious,
        handleContinue,
      }}
    >
      {children}
    </ReturnContext.Provider>
  )
}

export const useReturn = () => {
  const ctx = useContext(ReturnContext)
  if (!ctx) throw new Error('useReturn must be used inside ReturnProvider')
  return ctx
}
