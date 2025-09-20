import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import OrderDetails from "./Tabs/OrderDetails";
import OrderShipping from "./Tabs/OrderShipping";
import CustomerInfo from "./Tabs/CustomerInfo";
import OrderReturns from "./Tabs/OrderReturns";
import SubNavigation from "@/Components/Tabs/SubTab/SubNavigation";
import SubContent from "@/Components/Tabs/SubTab/SubContent";

type TabKey = "details" | "shipping" | "returns" | "customer";

interface Props {
  order: any;
  auth: any;
  isExpanded: boolean;
}

export default function OrderRowDropdown({ order, auth, isExpanded }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  const isAdmin = Boolean(auth?.user?.isAdmin || auth?.isAdmin || auth?.admin);
  const isReturnable = order.returnable === true;

  const discountAmount =
    order.discount > 0 ? ((order.discount / 100) * order.subtotal).toFixed(2) : "0.00";

  const leftTabs = [
    { key: "details" as TabKey, label: "Details" },
    { key: "shipping" as TabKey, label: "Shipping" },
    ...(isReturnable ? [{ key: "returns" as TabKey, label: "Returns" }] : []),
  ];

  const rightTabs = isAdmin ? [{ key: "customer" as TabKey, label: "Customer" }] : [];

  if (!isExpanded) return null;

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
          {/* SubNavigation with left and right tabs */}
          <SubNavigation<TabKey>
            leftTabs={leftTabs}
            rightTabs={rightTabs}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
          />

          {/* SubContent blocks */}
          <div className="mt-4">
            <SubContent activeKey={activeTab} tabKey="details">
              <OrderDetails order={order} discountAmount={discountAmount} />
            </SubContent>

            <SubContent activeKey={activeTab} tabKey="shipping">
              <OrderShipping order={order} />
            </SubContent>

            <SubContent activeKey={activeTab} tabKey="returns">
              <OrderReturns order={order} isReturnable={isReturnable} />
            </SubContent>

            <SubContent activeKey={activeTab} tabKey="customer">
              <CustomerInfo order={order} />
            </SubContent>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
