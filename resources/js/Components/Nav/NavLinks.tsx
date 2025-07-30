import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  FaHome,
  FaStore,
  FaInfoCircle,
  FaUserCircle,
  FaShoppingCart,
  FaMoon,
  FaSun,
} from "react-icons/fa";

import SubNavigation from "../Tabs/SubTab/SubNavigation";
import SubContent from "../Tabs/SubTab/SubContent";

const leftItems = [
  { name: "HOME", routeName: "/", icon: <FaHome size={20} /> },
  { name: "SHOP", routeName: "/shop", icon: <FaStore size={20} /> },
  { name: "ABOUT", routeName: "/about", icon: <FaInfoCircle size={20} /> },
];

const rightItems = [
  { name: "DARKMODE_TOGGLE", routeName: "", icon: null }, // handled specially
  { name: "CART", routeName: "/cart", icon: <FaShoppingCart size={24} /> },
  { name: "PROFILE", routeName: "/profile", icon: <FaUserCircle size={24} /> },
];

export default function MENU() {
  const [activeKey, setActiveKey] = useState(leftItems[0].routeName);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    Inertia.get(key);
  };

  const handleRightClick = (item: typeof rightItems[number]) => {
    if (item.name === "DARKMODE_TOGGLE") {
      toggleDarkMode();
    } else if (item.routeName) {
      Inertia.get(item.routeName);
    }
  };

  // map leftItems to tabs expected by SubNavigation
  const tabs = leftItems.map((item) => ({
    key: item.routeName,
    label: (
      <span className="flex items-center gap-2">
        {item.icon}
        {item.name}
      </span>
    ),
  }));

  // Right content buttons
  const rightContent = (
    <div className="flex gap-4">
      {rightItems.map((item) =>
        item.name === "DARKMODE_TOGGLE" ? (
          <button
            key={item.name}
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="text-yellow-400 dark:text-yellow-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
          >
            {darkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
          </button>
        ) : (
          <button
            key={item.name}
            onClick={() => handleRightClick(item)}
            aria-label={item.name}
            className="text-gray-800 dark:text-gray-200 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
          >
            {item.icon}
          </button>
        )
      )}
    </div>
  );

  return (
    <div>
      <SubNavigation
        tabs={tabs}
        activeKey={activeKey}
        onChange={handleTabChange}
        rightContent={rightContent}
      />


    </div>
  );
}
