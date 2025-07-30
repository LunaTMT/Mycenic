import React, { useEffect, useState } from "react";
import { Tab } from "@/types/tabs";
import { motion } from "framer-motion";

interface SubNavigationProps<T extends string> {
  tabs?: Tab<T>[];
  activeKey?: T;
  onChange?: (key: T) => void;
  rightContent?: React.ReactNode;
}

export default function SubNavigation<T extends string>({
  tabs,
  activeKey,
  onChange,
  rightContent,
}: SubNavigationProps<T>) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Defer motion animations until after first render
    setHasMounted(true);
  }, []);

  const getTabClass = (key: T) =>
    `relative px-4 py-3 font-semibold transition-colors duration-300
    ${
      activeKey === key
        ? "text-yellow-500 dark:text-[#7289da]"
        : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"
    }`;

  return (
    <div className="flex w-full justify-between border-b border-black/20 dark:border-white/20 items-center">
      <div className="flex space-x-4 relative">
        {tabs &&
          onChange &&
          tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={getTabClass(tab.key)}
            >
              <span className="relative z-10">{tab.label}</span>

              {/* Animated underline — only after mount */}
              {activeKey === tab.key && hasMounted && (
                <motion.div
                  layoutId="subnav-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-500 dark:bg-[#7289da]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Static underline on first render to avoid jump */}
              {activeKey === tab.key && !hasMounted && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-500 dark:bg-[#7289da]" />
              )}
            </button>
          ))}
      </div>
      {rightContent && <div className="flex items-center space-x-2">{rightContent}</div>}
    </div>
  );
}
