import React, { useEffect, useState } from "react";
import { Tab } from "@/types/tabs";

interface TabNavigationProps<T = string> {
  tabs: Tab<T>[];
  activeTab: T;
  setActiveTab: (tab: T) => void;
}

export default function TabNavigation<T extends string>({
  tabs,
  activeTab,
  setActiveTab,
}: TabNavigationProps<T>) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="flex border-b gap-0 bg-transparent border-gray-300 dark:border-gray-600">
      {tabs.map(({ key, label, icon }) => {
        const isActive = activeTab === key;

        return (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              group relative flex-1 px-8 py-3 text-center font-medium text-lg font-Poppins flex justify-center items-center
              transition-colors duration-300
              ${
                isActive
                  ? "bg-yellow-500 text-white dark:bg-[#7289da] dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"
              }
            `}
          >
            <span className="inline-block transition-transform duration-300 group-hover:scale-110">
              {icon}
            </span>
            <span>{label}</span>

            {/* Active underline */}
            {isActive && hasMounted && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-yellow-500 dark:bg-[#7289da]" />
            )}

            {/* Static underline on first render to avoid jump */}
            {isActive && !hasMounted && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-yellow-500 dark:bg-[#7289da]" />
            )}

            {/* Hover underline for inactive tabs */}
            {!isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-transparent group-hover:bg-yellow-400 dark:group-hover:bg-[#5a75d1] transition-colors duration-300" />
            )}
          </button>
        );
      })}
    </div>
  );
}
