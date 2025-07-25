import React, { ReactNode, useEffect, useState } from "react";

interface SubContentProps {
  activeKey: string;
  tabKey: string;
  children: ReactNode;
}

export default function SubContent({ activeKey, tabKey, children }: SubContentProps) {
  const [shouldRender, setShouldRender] = useState(activeKey === tabKey);
  const [visible, setVisible] = useState(activeKey === tabKey);

  useEffect(() => {
    if (activeKey === tabKey) {
      setShouldRender(true);
      setTimeout(() => setVisible(true), 10); // small delay for transition
    } else {
      setVisible(false);
      const timeout = setTimeout(() => setShouldRender(false), 300); // match CSS transition duration
      return () => clearTimeout(timeout);
    }
  }, [activeKey, tabKey]);

  if (!shouldRender) return null;

  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="tabpanel"
      aria-hidden={activeKey !== tabKey}
    >
      {children}
    </div>
  );
}
