import React from "react";
import SortByDropdown from "./Tabs/Reviews/test/SortByDropdown";

interface Tab {
  key: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export default function TabNavigation({
  tabs,
  activeKey,
  onChange,
  sortBy,
  onSortChange,
}: TabNavigationProps) {
  const getTabClass = (key: string) =>
    `px-4 py-2 font-semibold transition-transform duration-300 border-b-2 border-transparent
     ${
       activeKey === key
         ? "text-yellow-500 dark:text-[#7289da] border-yellow-500 dark:border-[#7289da]"
         : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"
     }
     hover:scale-[1.03]`;

  return (
    <div className="flex items-center border-b border-black/20 dark:border-white/20 ">
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={getTabClass(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-grow" />

      
    </div>
  );
}
