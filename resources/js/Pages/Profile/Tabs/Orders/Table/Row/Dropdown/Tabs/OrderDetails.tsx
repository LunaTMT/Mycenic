import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";
import PaymentStatusBadge from "../../Badges/PaymentStatusBadge";
import ShippingStatusBadge from "../../Badges/ShippingStatusBadge";
import ReturnableStatusBadge from "../../Badges/ReturnableStatusBadge";

const statusItems = [
  { label: "Payment", valueKey: "payment_status", BadgeComponent: PaymentStatusBadge },
  { label: "Shipping", valueKey: "shipping_status", BadgeComponent: ShippingStatusBadge },
  { label: "Returnable", valueKey: "returnable", BadgeComponent: ReturnableStatusBadge },
];

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
  console.log(order);
  return (
    <div className="w-full flex  gap-6">
      {/* Left: Cart and Summary */}
      <div className="w-full   dark:bg-[#424549] border border-black/20 dark:border-white/20 p-6 rounded-xl shadow-2xl">
        {/* Cart Items */}
        <div className="space-y-2 mb-8">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-8">Items</h4>

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
                className="flex items-center justify-between"
              >
                <Link href={`/item/${item.id}`} className="flex items-center gap-4 group">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-md font-semibold text-gray-900 dark:text-white">{item.name}</p>
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

        {/* Summary */}
        <div className="pt-6 border-t border-gray-300 dark:border-gray-600">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h4>

          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal</span>
              <span>£{safeNumber(order.subtotal).toFixed(2)}</span>
            </div>

            {safeNumber(order.discount) > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Discount</span>
                <span className="text-sm font-bold text-green-500">-£{discountAmount}</span>
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

      {/* Right: Order Statuses */}
      <div className="w-full md:w-1/2 bg-white dark:bg-[#424549] border border-black/20 dark:border-white/20 p-6 rounded-xl shadow-2xl text-gray-800 dark:text-white space-y-4 text-md">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-8">Statuses</h4>
        {statusItems.map(({ label, valueKey, BadgeComponent }) => {
          const statusValue = order[valueKey];
          return (
            <div
              key={valueKey}
              className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0"
            >
              <span className="font-semibold">{label}:</span>
              {statusValue !== undefined && statusValue !== null ? (
                <BadgeComponent
                  {...(valueKey === "returnable"
                    ? { returnable: statusValue }
                    : { status: statusValue })}
                />
              ) : (
                <span>N/A</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
