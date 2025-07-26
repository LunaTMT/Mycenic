import React from "react";
import { Tab } from "@/types/tabs";

interface SubNavigationProps<T extends string> {
  tabs?: Tab<T>[];              // optional now
  activeKey?: T;                // optional now
  onChange?: (key: T) => void;  // optional now
  rightContent?: React.ReactNode;
}

export default function SubNavigation<T extends string>({
  tabs,
  activeKey,
  onChange,
  rightContent,
}: SubNavigationProps<T>) {
  const getTabClass = (key: T) =>
    `p-2 font-semibold transition-transform duration-300 border-b-2 border-transparent
     ${
       activeKey === key
         ? "text-yellow-500 dark:text-[#7289da] border-yellow-500 dark:border-[#7289da]"
         : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"
     }
     hover:scale-[1.03]`;

  return (
    <div className="flex items-center justify-between border-b border-black/20 dark:border-white/20 px-2">
      <div className="flex space-x-4 ">
        {/* Only render tabs if all necessary props are present */}
        {tabs && onChange && activeKey && tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={getTabClass(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {rightContent && <div className="flex items-center space-x-2">{rightContent}</div>}
    </div>
  );
}
