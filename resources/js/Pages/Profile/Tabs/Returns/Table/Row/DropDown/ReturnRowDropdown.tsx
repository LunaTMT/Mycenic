// ReturnRowDropdown.tsx

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import Details from "./Tabs/Details";
import Shipping from "./Tabs/Shipping";
import Decision from "./Tabs/Decision"; // renamed import
import Statuses from "./Tabs/Statuses";
import Customer from "./Tabs/Customer";

type TabKey = "details" | "shipping" | "decision" | "statuses" | "customer";

type ReturnRowDropdownProps = {
  returnData: any;
  isExpanded: boolean;
};

export default function ReturnRowDropdown({ returnData, isExpanded }: ReturnRowDropdownProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  if (!isExpanded || !returnData) return null;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "shipping", label: "Shipping" },
    { key: "decision", label: "Decision" }, // updated label and key
    { key: "statuses", label: "Statuses" },
    { key: "customer", label: "Customer" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key={`return-dropdown-${returnData.id}`}
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
                .filter(({ key }) => ["details", "shipping", "decision"].includes(key))
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
                .filter(({ key }) => ["statuses", "customer"].includes(key))
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
          {/* Tab content */}
          <div className="mt-2 space-y-4 text-sm text-gray-800 dark:text-white">
            {activeTab === "details" && <Details returnData={returnData} />}
            {activeTab === "shipping" && <Shipping returnData={returnData} />}
            {activeTab === "decision" && <Decision returnData={returnData} />}
            {activeTab === "statuses" && <Statuses returnData={returnData} />}
            {activeTab === "customer" && <Customer returnData={returnData} />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
