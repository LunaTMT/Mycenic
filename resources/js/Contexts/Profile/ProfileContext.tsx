import React, { createContext, useContext, useState, useEffect } from "react";

type TabKey = "profile" | "orders" | "returns";

interface ProfileContextType {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  tabs: { key: TabKey; label: string }[];
}

interface ProfileProviderProps {
  children: React.ReactNode;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const validTabs: TabKey[] = ["profile", "orders", "returns"];

  const getInitialTab = (): TabKey => {
    const stored = localStorage.getItem("activeTab") as TabKey | null;
    return stored && validTabs.includes(stored) ? stored : "profile";
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const tabs = [
    { key: "profile" as const, label: "Profile" },
    { key: "orders" as const, label: "Orders" },
    { key: "returns" as const, label: "Returns" },
  ];

  return (
    <ProfileContext.Provider value={{ activeTab, setActiveTab, tabs }}>
      {children}
    </ProfileContext.Provider>
  );
};
