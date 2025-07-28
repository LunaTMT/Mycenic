import React, { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import { ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { FaBox, FaBookOpen, FaStar } from "react-icons/fa";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";

import { ItemProvider } from "@/Contexts/Shop/Items/ItemContext";

import Item from "./Tabs/Item/Item";
import Guides from "./Tabs/Guides/Guides";
import Feedback from "./Tabs/Feedback/Feedback";

import TabNavigation, { Tab } from "@/Components/Tabs/TabNavigation";
import TabContent from "@/Components/Tabs/TabContent";
import { Item as ItemType, User } from "@/types/types";

type TabKey = "Item" | "Guides" | "Feedback";

interface ItemPageProps {
  item: ItemType;
}

const tabs: Tab<TabKey>[] = [
  { key: "Item", label: "Item", icon: <FaBox size={20} className="inline mr-2" /> },
  { key: "Guides", label: "Guides", icon: <FaBookOpen size={20} className="inline mr-2" /> },
  { key: "Feedback", label: "Feedback", icon: <FaStar size={20} className="inline mr-2" /> },
];

const ItemPage: React.FC<ItemPageProps> = ({ item }) => {
  const { auth } = usePage().props as { auth?: { user?: User } };
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  console.log(item);
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const savedTab = localStorage.getItem("activeItemTab");
    return (savedTab as TabKey) || "Item";
  });

  useEffect(() => {
    localStorage.setItem("activeItemTab", activeTab);
  }, [activeTab]);

  return (
    <Layout>
      <Head title={`${item.category}/${item.name}`} />

      <ItemProvider item={item}>
        <div className="relative w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex justify-center items-start font-Poppins">
          <div className="w-full h-full dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl">
            <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-4 h-full"
              >
                <TabContent activeKey={activeTab} tabKey="Item">
                  <Item />
                </TabContent>
                <TabContent activeKey={activeTab} tabKey="Guides">
                  <Guides />
                </TabContent>
                <TabContent activeKey={activeTab} tabKey="Feedback">
                  <Feedback />
                </TabContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </ItemProvider>

      <ToastContainer position="bottom-right" />
    </Layout>
  );
};

export default ItemPage;
