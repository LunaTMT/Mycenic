import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Head, usePage } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TabNavigation from "@/Components/Tabs/TabNavigation";
import ProfileTabContent from "./Tabs/Profile/ProfileTabContent";
import CustomerOrders from "./Tabs/Orders/CustomerOrders";
import { User } from "@/types/User";

type TabKey = "profile" | "orders" | "returns";

interface Order {
  id: number;
  // extend with other fields from your Order model
}

interface Props {
  mustVerifyEmail: boolean;
  status?: string | null;
  user: User;
  initialTab?: TabKey | null;
  orders: Order[];
}

const tabs = [
  { key: "profile" as const, label: "Profile" },
  { key: "orders" as const, label: "Orders" },
  { key: "returns" as const, label: "Returns" },
];

function ReturnsTabContent() {
  return (
    <div className="text-center text-gray-700 dark:text-gray-300">
      <h2 className="text-2xl font-semibold mb-4">Returns</h2>
      <p>Returns tab content goes here.</p>
    </div>
  );
}

export default function Profile({
  initialTab,
}: Props) {
  const validTabs: TabKey[] = ["profile", "orders", "returns"];

  const getInitialTab = (): TabKey => {
    if (initialTab && validTabs.includes(initialTab)) return initialTab;
    const stored = localStorage.getItem("activeTab") as TabKey | null;
    return stored && validTabs.includes(stored) ? stored : "profile";
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const { auth } = usePage<PageProps>().props;
  const isAdmin = auth?.user?.is_admin || false; // keep if you'll use later

  return (
    <AuthenticatedLayout>
      <Head title="Profile" />

      <div className="relative z-10 w-full h-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex flex-col items-center font-Poppins">
        <div className="w-full h-full dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl overflow-hidden">
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-4 h-full"
            >
              {activeTab === "profile" && (<ProfileTabContent/>)}
              {activeTab === "orders" && <CustomerOrders/>}
              {activeTab === "returns" && <ReturnsTabContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
