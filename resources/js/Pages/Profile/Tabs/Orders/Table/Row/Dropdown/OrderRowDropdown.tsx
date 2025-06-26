import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import OrderDetails from "./Tabs/OrderDetails";
import OrderShipping from "./Tabs/OrderShipping";
import CustomerInfo from "./Tabs/CustomerInfo";
import OrderReturns from "./Tabs/OrderReturns";

type TabKey = "details" | "shipping" | "payment" | "returns" | "customer";

interface Props {
  order: any;
  auth: any;
  isExpanded: boolean;
}

export default function OrderRowDropdown({ order, auth, isExpanded }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  // Debug: Log auth to see its shape
  useEffect(() => {
    console.log("Auth prop received:", auth);
  }, [auth]);

  if (!isExpanded) return null;

  // Safer admin check
  const isAdmin = Boolean(auth?.user?.isAdmin || auth?.isAdmin || auth?.admin);

  const isReturnable = order.returnable === true;
  const discountAmount =
    order.discount > 0 ? ((order.discount / 100) * order.subtotal).toFixed(2) : "0.00";

  const tabs: { key: TabKey; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "shipping", label: "Shipping" },
    ...(isReturnable ? [{ key: "returns", label: "Returns" }] : []),
    ...(isAdmin ? [{ key: "customer", label: "Customer" }] : []),
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full bg-white dark:bg-[#424549] border border-t-0 border-black/20 dark:border-white/20 rounded-b-xl shadow-2xl overflow-hidden"
      >
        <div className="p-4">
          {/* Tabs with left and right groups */}
          <div className="flex justify-between border-b border-gray-300 dark:border-gray-600 mb-4">
            {/* Left group */}
            <div className="flex gap-4">
              {tabs
                .filter(({ key }) => ["details", "shipping", "payment", "returns"].includes(key))
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
                .filter(({ key }) => key === "customer")
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
            {activeTab === "details" && (
              <OrderDetails order={order} discountAmount={discountAmount} />
            )}
            {activeTab === "shipping" && <OrderShipping order={order} />}
            {activeTab === "returns" && (
              <OrderReturns order={order} isReturnable={isReturnable} />
            )}
            {activeTab === "customer" && <CustomerInfo order={order} />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
