import React from "react";
import { FaUser, FaShippingFast, FaUndoAlt } from "react-icons/fa";

export type TabKey = "profile" | "orders" | "returns";

interface TabNavigationProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { key: "profile", label: "Profile", icon: <FaUser size={24} className="inline mr-2" /> },
    { key: "orders", label: "Orders", icon: <FaShippingFast size={24} className="inline mr-2" /> },
    { key: "returns", label: "Returns", icon: <FaUndoAlt size={24} className="inline mr-2" /> },
  ];

  return (
    <div className="flex border-b border-gray-300 dark:border-gray-600">
      {tabs.map(({ key, label, icon }, index, arr) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`
            flex-1 px-6 py-4 text-center font-semibold text-lg transition-colors flex justify-center items-center
            ${
              activeTab === key
                ? "border-b-4 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#53575a]"
            }
            ${index === 0 ? "rounded-tl-lg" : ""}
            ${index === arr.length - 1 ? "rounded-tr-lg" : ""}
          `}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}
