import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from 'react'
import axios from 'axios'
import { Inertia } from '@inertiajs/inertia'

export type ReturnItem = {
  id: number
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
  amount: string
  currency: string
  rateId?: string
}

interface Step {
  text: string
  component: React.ReactNode
}

interface ReturnContextType {
  items: ReturnItem[]
  returnableItems: ReturnItem[]
  selectedItems: Array<[number, number]> // [id, qty]
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
  handleFinish: () => Promise<void>
  toggleItem: (id: number) => void
  updateQuantity: (id: number, qty: number) => void
  fetchShippingOptions: () => Promise<void>
  setPaymentIntentClientSecret: (secret: string | null) => void
  setHasPaid: (paid: boolean) => void
  setOrderId: (id: string | number | null) => void
  setFromAddress: (addr: any) => void
  setFinishLabel: (label: string) => void
  setSelectedShippingOption: (option: ShippingOptionData | null) => void
  setShippingLabelUrl: (url: string | null) => void
}

const ReturnContext = createContext<ReturnContextType | undefined>(undefined)

export const ReturnInstructionProvider = ({
  children,
  initialItems,
  orderID,
}: {
  children: ReactNode
  initialItems: ReturnItem[]
  orderID: string | number
}) => {
  const [items] = useState<ReturnItem[]>(initialItems)

  const [alreadyReturnedItemIds, setAlreadyReturnedItemIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('alreadyReturnedItemIds')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alreadyReturnedItemIds', JSON.stringify(alreadyReturnedItemIds))
    }
  }, [alreadyReturnedItemIds])

  

  useEffect(() => {
    setAlreadyReturnedItemIds([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alreadyReturnedItemIds')
    }
  }, [orderID])

  const returnableItems = useMemo(() => {
    return items.filter(item => !alreadyReturnedItemIds.includes(item.id))
  }, [items, alreadyReturnedItemIds])

  // selectedItems: [id, qty], initially empty (nothing selected)
  const [selectedItems, setSelectedItems] = useState<Array<[number, number]>>([])

  useEffect(() => {
    console.log('Selected Items:', selectedItems)
  }, [selectedItems])

  const [shippingOptions, setShippingOptions] = useState<ShippingOptionData[]>([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOptionData | null>(null)

  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null)
  const [hasPaid, setHasPaid] = useState(false)
  const [orderId, setOrderId] = useState<string | number | null>(orderID)
  const [fromAddress, setFromAddress] = useState<any>(null)
  const [finishLabel, setFinishLabel] = useState('Finish')
  const [shippingLabelUrl, setShippingLabelUrl] = useState<string | null>(null)

  const totalSteps = 7
  const [currentStep, setCurrentStep] = useState(1)
  const steps: Step[] = []

  const grandTotal = useMemo(() => {
    return selectedItems.reduce((sum, [id, qty]) => {
      const item = items.find(i => i.id === id)
      if (!item) return sum
      return sum + item.price * qty
    }, 0)
  }, [selectedItems, items])

  const toggleItem = (id: number) => {
    setSelectedItems(prev => {
      const index = prev.findIndex(([itemId]) => itemId === id)
      if (index >= 0) {
        // Remove the item
        const newSelected = [...prev]
        newSelected.splice(index, 1)
        return newSelected
      } else {
        // Add item with qty 1
        return [...prev, [id, 1]]
      }
    })
  }

  const updateQuantity = (id: number, qty: number) => {
    setSelectedItems(prev => {
      const index = prev.findIndex(([itemId]) => itemId === id)
      if (index >= 0) {
        const newSelected = [...prev]
        if (qty <= 0) {
          newSelected.splice(index, 1)
        } else {
          newSelected[index] = [id, qty]
        }
        return newSelected
      } else {
        // Add if qty > 0
        return qty > 0 ? [...prev, [id, qty]] : prev
      }
    })
  }

  const fetchShippingOptions = async () => {
    if (!orderId) return
    setShippingLoading(true)
    setShippingError(null)
    try {
      const response = await axios.post<ShippingOptionData[]>(
        `/orders/${orderId}/return/fetch-return-options`
      )
      setShippingOptions(response.data)
    } catch {
      setShippingError('Failed to load shipping options.')
    } finally {
      setShippingLoading(false)
    }
  }

  const changeStep = (newStep: number) => {
    if (newStep >= 1 && newStep <= totalSteps) setCurrentStep(newStep)
  }

  const handlePrevious = () => {
    if (currentStep > 1) changeStep(currentStep - 1)
  }

  const handleContinue = () => {
    if (currentStep < totalSteps) changeStep(currentStep + 1)
  }

  const handleFinish = async () => {
    if (!orderId) return

    const payload = {
      paymentIntentClientSecret,
      selectedShippingOption,
      shippingLabelUrl,
      selectedItems,
      finishedAt: new Date().toISOString(),
    }
    console.log(selectedItems)
    await Inertia.post(`/orders/${orderId}/return/finish`, payload)

    setAlreadyReturnedItemIds(prev =>
      [...new Set([...prev, ...selectedItems.map(([id]) => id)])]
    )

    setSelectedItems([])
  }

  return (
    <ReturnContext.Provider
      value={{
        items,
        returnableItems,
        selectedItems,
        shippingOptions,
        shippingLoading,
        shippingError,
        selectedShippingOption,
        grandTotal,
        paymentIntentClientSecret,
        hasPaid,
        orderId,
        fromAddress,
        finishLabel,
        shippingLabelUrl,
        currentStep,
        steps,
        changeStep,
        handlePrevious,
        handleContinue,
        handleFinish,
        toggleItem,
        updateQuantity,
        fetchShippingOptions,
        setPaymentIntentClientSecret,
        setHasPaid,
        setOrderId,
        setFromAddress,
        setFinishLabel,
        setSelectedShippingOption,
        setShippingLabelUrl,
      }}
    >
      {children}
    </ReturnContext.Provider>
  )
}

export const useReturn = (): ReturnContextType => {
  const context = useContext(ReturnContext)
  if (!context) throw new Error('useReturn must be used within ReturnProvider')
  return context
}
