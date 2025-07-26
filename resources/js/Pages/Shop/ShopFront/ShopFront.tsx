import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";

import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import FilterButton from "@/Components/Buttons/FilterButton";
import SortDropdown from "@/Components/Dropdown/SortDropdown";
import AddItemButton from "@/Components/Buttons/AddItemButton";

import { ShopProvider } from "@/Contexts/Shop/ShopContext";

import TabNavigation from "@/Components/Tabs/TabNavigation";
import TabContent from "@/Components/Tabs/TabContent";

import ItemsTab from "./Tabs/ItemsTab";
import CartTab from "./Tabs/CartTab";

import { FaBoxOpen, FaShoppingCart } from "react-icons/fa";

import { User } from "@/types/types";

const tabs = [
  {
    key: "items",
    label: "Items",
    icon: <FaBoxOpen className="inline-block mr-2" />,
  },
  {
    key: "cart",
    label: "Cart",
    icon: <FaShoppingCart className="inline-block mr-2" />,
  },
];

const ShopContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("items");

  return (
    <>
      <Head title="Shop" />

      <div className="relative w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex justify-center items-start font-Poppins">
        <div className="w-full h-full dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl overflow-hidden">
          <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <TabContent activeKey={activeTab} tabKey="items">
            <ItemsTab />
          </TabContent>

          <TabContent activeKey={activeTab} tabKey="cart">
            <CartTab />
          </TabContent>
        </div>
      </div>
    </>
  );
};

interface ShopProps {
  items: any[];
  cartItems?: any[];
}

const Shop: React.FC<ShopProps> = ({ items }) => {
  const { auth } = usePage().props as { auth?: { user?: User } };

  // Choose layout based on authentication
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

  return (
    <Layout>
      <ShopProvider items={items}>
        <ShopContent />
      </ShopProvider>
    </Layout>
  );
};

export default Shop;
