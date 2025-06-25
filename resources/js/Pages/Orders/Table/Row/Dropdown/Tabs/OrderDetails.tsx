import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";


export default function OrderDetails({
  order,
  discountAmount,
}: {
  order: any;
  discountAmount: string;
}) {
  const safeNumber = (value: any) => {
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  };

  return (
    <div className="w-full border border-gray-300 dark:border-gray-700 p-6 rounded-lg bg-white dark:bg-[#1e2124] shadow-md">
      {/* Cart Items */}
      <div className="space-y-2 mb-8">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h4>

        {order.cart.map((item: any) => {
          const price = safeNumber(item.price);
          const quantity = safeNumber(item.quantity);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between "
            >
              <Link href={`/item/${item.id}`} className="flex items-center gap-4 group">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="text-md font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {quantity} × £{price.toFixed(2)}
                  </p>
                </div>
              </Link>
              <p className="text-md font-semibold text-gray-900 dark:text-white">
                £{(quantity * price).toFixed(2)}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="pt-6 border-t border-gray-300 dark:border-gray-600">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Summary
        </h4>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal</span>
            <span>£{safeNumber(order.subtotal).toFixed(2)}</span>
          </div>

          {safeNumber(order.discount) > 0 && (
            <div className="flex justify-between text-red-400 dark:text-red-400">
              <span className="font-medium">Discount</span>
              <span>-£{discountAmount}</span>
            </div>
          )}

          

          <div className="flex justify-between">
            <span className="font-medium">Shipping</span>
            <span>£{safeNumber(order.shipping_cost).toFixed(2)}</span>
          </div>

          <hr className="border-gray-300 dark:border-gray-600 my-3" />

          <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
            <span>Grand Total</span>
            <span>£{safeNumber(order.total).toFixed(2)}</span>
          </div>


          {order.payment_method && (
            <div className="flex justify-between pt-2">
              <span className="font-medium">Payment Method</span>
              <span>{order.payment_method}</span>
            </div>
          )}

          {order.estimated_delivery && (
            <div className="flex justify-between">
              <span className="font-medium">Estimated Delivery</span>
              <span>
                {new Date(order.estimated_delivery).toLocaleDateString("en-GB")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
