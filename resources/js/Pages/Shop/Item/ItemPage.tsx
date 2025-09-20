import React from "react";
import { Head, usePage } from "@inertiajs/react";


import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GuestLayout from "@/Layouts/GuestLayout";

import { ItemProvider } from "@/Contexts/Shop/Items/ItemContext";

import ItemTab from "./Item/ItemTab";
import Feedback from "./Feedback/Feedback";

import { User } from "@/types/User";
import { Item } from "@/types/Item";

interface ItemPageProps {
  item: Item;
}

const ItemPage: React.FC<ItemPageProps> = ({ item }) => {
  const { auth } = usePage().props as { auth?: { user?: User } };
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  console.log(item);
  return (
    <Layout>
      <Head title={`${item.category}/${item.name}`} />

      <ItemProvider item={item}>
        <div className="relative w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 flex flex-col justify-center items-start font-Poppins space-y-6">
          <div className="w-full">
            <ItemTab />
          </div>

          <div className="w-full dark:bg-[#424549] dark:border-white/20 border border-black/20 rounded-xl shadow-2xl p-4">
            <Feedback />
          </div>
        </div>
      </ItemProvider>

      
    </Layout>
  );
};

export default ItemPage;
