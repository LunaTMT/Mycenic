import { motion } from "framer-motion";
import { Link } from "@inertiajs/react";

type ReturnDetailsProps = {
  returnData: {
    items?: any[];
    subtotal?: number | string;
    discount?: number | string;
    shipping_cost?: number | string;
    total?: number | string;
    discountAmount?: string;
    payment_method?: string;
    estimated_delivery?: string;
  };
};

export default function ReturnDetails({ returnData }: ReturnDetailsProps) {
  const safeNumber = (value: any) => {
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  };

  const items = Array.isArray(returnData.items) ? returnData.items : [];
  const subtotal = safeNumber(returnData.subtotal);
  const discount = safeNumber(returnData.discount);
  const shipping = safeNumber(returnData.shipping_cost);
  const total = safeNumber(returnData.total);
  const discountAmount = returnData.discountAmount ?? discount.toFixed(2);

  return (
    <div className="w-full border border-gray-300 dark:border-gray-700 p-6 rounded-lg bg-white dark:bg-[#1e2124] shadow-md">
      {/* Returned Items */}
      <div className="space-y-6 mb-8">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Returned Items</h4>

        {items.length > 0 ? (
          items.map((item: any) => {
            const price = safeNumber(item.price);
            const quantity = safeNumber(item.quantity);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between gap-6"
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
          })
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No items in this return.</p>
        )}
      </div>

      {/* Return Summary */}
      <div className="pt-6 border-t border-gray-300 dark:border-gray-600">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Summary
        </h4>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal</span>
            <span>£{subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span className="font-medium">Discount</span>
              <span>-£{discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-medium">Shipping</span>
            <span>£{shipping.toFixed(2)}</span>
          </div>

          <hr className="border-gray-300 dark:border-gray-600 my-3" />

          <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
            <span>Grand Total</span>
            <span>£{total.toFixed(2)}</span>
          </div>

          {returnData.payment_method && (
            <div className="flex justify-between pt-2">
              <span className="font-medium">Payment Method</span>
              <span>{returnData.payment_method}</span>
            </div>
          )}

          {returnData.estimated_delivery && (
            <div className="flex justify-between">
              <span className="font-medium">Estimated Delivery</span>
              <span>
                {new Date(returnData.estimated_delivery).toLocaleDateString("en-GB")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
