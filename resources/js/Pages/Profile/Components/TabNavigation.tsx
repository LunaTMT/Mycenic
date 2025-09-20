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
    <div className="flex border-b gap-0 bg-transparent border-gray-300 dark:border-gray-600">
      {tabs.map(({ key, label, icon }, index, arr) => {
        const isActive = activeTab === key;

        // Determine border-radius per position (never changes)
        let borderRadiusClass = "";
        if (index === 0) borderRadiusClass = "rounded-tl-lg rounded-tr-0";
        else if (index === arr.length - 1) borderRadiusClass = "rounded-tr-lg rounded-tl-0";
        else borderRadiusClass = "rounded-none";

        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              group flex-1 px-8 py-3 text-center font-medium text-lg font-Poppins flex justify-center items-center
              ${borderRadiusClass}
              ${
                isActive
                  ? `bg-yellow-500 text-white dark:bg-[#7289da] 
                    hover:shadow-[0_0_1px_#FFD700,0_0_4px_#FFD700,0_0_8px_#FFD700] 
                    dark:hover:shadow-[0_0_2px_#93c5fd,0_0_6px_#60a5fa,0_0_10px_#2563eb]`
                  : `text-gray-600 dark:text-gray-300 
                    hover:bg-gray-100 dark:hover:bg-[#53575a] 
                    hover:shadow-[0_0_1px_#FFD700,0_0_4px_#FFD700,0_0_8px_#FFD700] 
                    dark:hover:shadow-[0_0_2px_#93cfd,0_0_6px_#60a5fa,0_0_10px_#2563eb]`
              }
              transition-transform duration-300
            `}
          >
            <span className="inline-block transition-transform duration-300 group-hover:scale-110">
              {icon}
            </span>
            <span>{label}</span>
          </button>

        );
      })}
    </div>
  );
}
