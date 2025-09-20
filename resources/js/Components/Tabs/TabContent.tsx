import React, { useState, useEffect, ReactNode } from "react";

interface TabContentProps<T = string> {
  activeKey: T;
  tabKey: T;
  children: ReactNode;
}

export default function TabContent<T extends string>({ activeKey, tabKey, children }: TabContentProps<T>) {
  const [shouldRender, setShouldRender] = useState(activeKey === tabKey);
  const [visible, setVisible] = useState(activeKey === tabKey);

  useEffect(() => {
    if (activeKey === tabKey) {
      setShouldRender(true);
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [activeKey, tabKey]);

  if (!shouldRender) return null;

  return (
    <div
      className={`transition-opacity w-full h-full  duration-300 ease-in-out ${visible ? "opacity-100" : "opacity-0"}`}
      role="tabpanel"
      aria-hidden={activeKey !== tabKey}
    >
      {children}
    </div>
  );
}
