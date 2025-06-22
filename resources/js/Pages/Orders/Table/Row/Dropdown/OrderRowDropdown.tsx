import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import OrderDetails from "./Tabs/OrderDetails";
import OrderShipping from "./Tabs/OrderShipping";

import CustomerInfo from "./Tabs/CustomerInfo";
import OrderReturns from "./Tabs/OrderReturns";
import { OrderStatuses } from "./Tabs/OrderStatuses";

type TabKey = "details" | "statuses" | "tracking" | "payment" | "returns" | "customer";

interface Props {
  order: any;
  auth: any;
  isExpanded: boolean;
}

export default function OrderRowDropdown({ order, auth, isExpanded }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  if (!isExpanded) return null;

  const isReturnable = order.returnable === true;
  const discountAmount =
    order.discount > 0 ? ((order.discount / 100) * order.subtotal).toFixed(2) : "0.00";

  const tabs: { key: TabKey; label: string }[] = [
    { key: "details", label: "Order Details" },
    { key: "tracking", label: "Shipping" },
    ...(isReturnable ? [{ key: "returns", label: "Returns" }] : []),
    { key: "statuses", label: "Statuses" },
    { key: "customer", label: "Customer" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="bg-white dark:bg-[#1e2124] overflow-hidden rounded-b-xl shadow-md"
      >
        <div className="p-4">
          {/* Tabs with left and right groups */}
          <div className="flex justify-between border-b border-gray-300 dark:border-gray-600 mb-4">
            {/* Left group */}
            <div className="flex gap-4">
              {tabs
                .filter(({ key }) => ["details", "tracking", "payment", "returns"].includes(key))
                .map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 py-2 font-semibold transition ${
                      activeTab === key
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
            </div>

            {/* Right group */}
            <div className="flex gap-4">
              {tabs
                .filter(({ key }) => ["customer", "statuses"].includes(key))
                .map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 py-2 font-semibold transition ${
                      activeTab === key
                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-2">
            {activeTab === "details" && <OrderDetails order={order} discountAmount={discountAmount} />}
            {activeTab === "tracking" && <OrderShipping order={order} />}

            {activeTab === "returns" && <OrderReturns order={order} isReturnable={isReturnable} />}
            {activeTab === "statuses" && <OrderStatuses order={order} />}
            {activeTab === "customer" && <CustomerInfo order={order} />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
