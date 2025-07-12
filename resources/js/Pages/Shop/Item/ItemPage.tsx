import React, { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import { ToastContainer } from "react-toastify";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";
import Breadcrumb from "@/Components/Nav/Breadcrumb";
import { ItemProvider } from "@/Contexts/Shop/Items/ItemContext";
import { AnimatePresence, motion } from "framer-motion";
import TabNavigation, { TabKey } from "./TabNavigation";

import Item from "./Tabs/Item/Item";
import Guides from "./Tabs/Guides/Guides";
import Feedback from "./Tabs/Feedback/Feedback";

interface ItemPageProps {
  item: {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    images: string;
    image_sources?: string;
    description: string;
    isPsyilocybinSpores: boolean;
    options?: string;
  };
}

const ItemPage: React.FC<ItemPageProps> = ({ item }) => {
  const { auth } = usePage().props as { auth?: { user?: any } };
  const user = auth?.user;
  const Layout = user ? AuthenticatedLayout : GuestLayout;

  const { getStock } = useCart();

  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const savedTab = localStorage.getItem("activeItemTab");
    return (savedTab as TabKey) || "Item";
  });

  useEffect(() => {
    localStorage.setItem("activeItemTab", activeTab);
  }, [activeTab]);

  return (
    <Layout
      header={
        <div className="h-[5vh] w-full flex justify-between items-center">
          <Breadcrumb
            items={[
              { label: "SHOP", link: route("shop") },
              { label: item.category, link: route("shop", { category: item.category }) },
              { label: item.name },
            ]}
          />
        </div>
      }
    >
      <Head title={`${item.category}/${item.name}`} />

      <ItemProvider item={item} getStock={getStock}>
        <div className="relative w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex justify-center items-start font-Poppins">
          <div className="w-full h-full dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl overflow-hidden">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-4 h-full"
              >
                {activeTab === "Item" && <Item item={item} />}
                {activeTab === "Guides" && <Guides />}
                {activeTab === "Feedback" && <Feedback />}
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
