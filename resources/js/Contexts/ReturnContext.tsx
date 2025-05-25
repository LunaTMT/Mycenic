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
  amount: string // or number if you parse it
  currency: string
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
  selectedShippingOption: string
  totalWeight: number

  paymentIntentClientSecret: string | null

  orderId: string | number | null
  fromAddress: any
  finishLabel: string

  currentStep: number
  steps: Step[]

  changeStep: (newStep: number) => void
  handlePrevious: () => void
  handleContinue: () => void

  totalSelected: number

  toggleItem: (index: number) => void
  updateQuantity: (index: number, qty: number) => void
  fetchShippingOptions: () => Promise<void>
  chooseShippingOption: (opt: string) => void
  setPaymentIntentClientSecret: (secret: string | null) => void

  setOrderId: (id: string | number | null) => void
  setFromAddress: (addr: any) => void
  setFinishLabel: (label: string) => void
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
  orderID: string
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
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('')

  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null)

  const [orderId, setOrderId] = useState<string | number | null>(orderID)
  const [fromAddress, setFromAddress] = useState<any>(null)
  const [finishLabel, setFinishLabel] = useState<string>('Finish')

  const totalSelected = useMemo(() => selectedItems.length, [selectedItems])

  const totalWeight = useMemo(() => {
    return selectedItems.reduce(
      (sum, i) => sum + (items[i].weight ?? 0) * returnQuantities[i],
      0
    )
  }, [selectedItems, returnQuantities, items])



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
      const resp = await axios.post<ShippingOptionData[]>( // Note: just ShippingOptionData[] because response data is array
        `/orders/${orderId}/return/get-return-options`,
      )
      console.log(resp.data)
      // resp.data is the array of options
      setShippingOptions(resp.data)
    } catch (err) {
      setShippingError('Failed to load shipping options.')
    } finally {
      setShippingLoading(false)
    }
  }


  const chooseShippingOption = (opt: string) => {
    setSelectedShippingOption(opt)
  }

  const totalSteps = 4
  const steps: Step[] = [] // You can populate this array with your actual steps

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
        totalWeight,
        paymentIntentClientSecret,
        orderId,
        fromAddress,
        finishLabel,
        totalSelected,

        toggleItem,
        updateQuantity,
        fetchShippingOptions,
        chooseShippingOption,
        setPaymentIntentClientSecret,
        setOrderId,
        setFromAddress,
        setFinishLabel,

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
