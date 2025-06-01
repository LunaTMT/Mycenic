import React from 'react'
import ItemCounter from './ItemCounter'
import { useReturn } from '@/Contexts/ReturnInstructionContext'

export default function ReturnItemTable() {
  const {
    items,
    selectedItems,
    returnQuantities,
    toggleItem,
    updateQuantity,
    currentStep,
    grandTotal,
  } = useReturn()

  const isActive = currentStep === 1

  return (
    <div className="w-full overflow-hidden rounded-xl shadow-lg border border-black/20 dark:border-white/20 dark:bg-[#424549]/80 mb-8">
      <table className="w-full">
        <thead className="bg-white dark:bg-[#1e2124] text-gray-900 dark:text-white">
          <tr>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-center">Quantity</th>
            <th className="px-4 py-2 text-center">Price</th>
            <th className="px-4 py-2 text-center">Total</th>
            <th className="px-4 py-2 text-center">Select</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/20 dark:divide-white/20">
          {items.map((item) => (
            <tr key={item.id} className="bg-white/70 dark:bg-[#424549]/20">
              <td className="px-4 py-3 flex items-center gap-4">
                {item.image && (
                  <img
                    src={'/' + item.image}
                    alt={item.name}
                    className="h-12 w-12 object-cover rounded-md"
                  />
                )}
                <span>{item.name}</span>
              </td>

              <td className="px-4 py-3 text-center">
                {selectedItems.includes(item.id) ? (
                  <ItemCounter
                    quantity={returnQuantities[item.id] ?? 1}
                    onQuantityChange={(val) => updateQuantity(item.id, val)}
                    max={item.quantity}
                    disabled={!isActive}
                    className="h-8"
                  />
                ) : (
                  <span>{item.quantity}</span>
                )}
              </td>

              <td className="px-4 py-3 text-center">
                £{(item.price ?? 0).toFixed(2)}
              </td>

              <td className="px-4 py-3 text-center">
                £{((item.price ?? 0) * (returnQuantities[item.id] ?? 0)).toFixed(2)}
              </td>

              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="form-checkbox h-5 w-5 text-green-600"
                  disabled={!isActive}
                />
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-gray-100 dark:bg-[#323537] font-semibold text-lg">
            <td className="px-4 py-2 text-right" colSpan={3}></td>
            <td className="px-4 py-2 text-center">£{grandTotal.toFixed(2)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
