import React from "react";
import { Head, usePage } from "@inertiajs/react";

import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";



import { ShopProvider } from "@/Contexts/Shop/ShopContext";

import ItemCard from "./ItemCard";

import { User } from "@/types/User";
import { Item } from "@/types/Item";

import { motion } from "framer-motion";

interface ShopProps {
  items: Item[];
  cartItems?: any[];
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const Shop: React.FC<ShopProps> = ({ items }) => {
  const { auth } = usePage().props as { auth?: { user?: User } };
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  console.log(items)
  return (
    <ShopProvider items={items}>
      <Layout>
        <Head title="Shop" />
        <div className="relative w-full max-w-7xl mx-auto sm:px-6 lg:px-8 p-5 font-Poppins">
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 50,
                  }}
                >
                  <ItemCard item={item} />
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </Layout>
    </ShopProvider>
  );
};

export default Shop;


/*{header={
          <div className="h-[5vh] w-full flex justify-start items-center">
            <div className="flex space-x-4">
              <FilterButton />
              <SortDropdown />
            
            <AddItemButton />
            </div>
          </div>
        }*/