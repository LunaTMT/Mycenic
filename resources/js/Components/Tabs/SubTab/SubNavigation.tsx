import React, { useEffect, useState } from "react";
import { Tab } from "@/types/tabs";
import { motion } from "framer-motion";

interface SubNavigationProps<T extends string> {
  leftTabs?: Tab<T>[];
  rightTabs?: Tab<T>[];
  activeKey?: T;
  onChange?: (key: T) => void;
}

export default function SubNavigation<T extends string>({
  leftTabs,
  rightTabs,
  activeKey,
  onChange,
}: SubNavigationProps<T>) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const getTabClass = (key: T) =>
    `relative px-4 py-3 font-semibold transition-colors duration-300
    ${
      activeKey === key
        ? "text-yellow-500 dark:text-[#7289da]"
        : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"
    }`;

  const renderTabs = (tabs?: Tab<T>[]) =>
    tabs?.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onChange?.(tab.key)}
        className={getTabClass(tab.key)}
      >
        <span className="relative z-10">{tab.label}</span>

        {activeKey === tab.key && hasMounted && (
          <motion.div
            layoutId="subnav-underline"
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-500 dark:bg-[#7289da]"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {activeKey === tab.key && !hasMounted && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-yellow-500 dark:bg-[#7289da]" />
        )}
      </button>
    ));

  return (
    <div className="flex w-full justify-between border-b border-black/20 dark:border-white/20 items-center">
      <div className="flex space-x-4 relative">{renderTabs(leftTabs)}</div>
      <div className="flex space-x-4 relative">{renderTabs(rightTabs)}</div>
    </div>
  );
}
