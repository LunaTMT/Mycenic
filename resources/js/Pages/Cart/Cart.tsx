import React, { useEffect, useState } from "react";
import { Head, usePage} from "@inertiajs/react";

import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import Item from "./old/Item/Item";

import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { User } from "@/types/User";

const Cart: React.FC = ( ) => {
  const { auth } = usePage().props as { auth?: { user?: User } };
  console.log(auth);
  const Layout = auth? AuthenticatedLayout : GuestLayout;

  const { cart } = useCart();
  console.log(cart);
  return (
    <Layout>
      <Head title="Cart" />

      <div className="relative min-h-[89vh] p-5 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex gap-10 justify-center items-start">
        <div className="w-[65%] space-y-3 p-4 flex flex-col justify-start items-center min-h-[80vh] rounded-lg bg-white/50 border border-black/20 dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 backdrop-blur-sm">
          {cart.items.map((item, index) => (
            <Item key={index} item={item} />
          ))}
        </div>

        <div className="w-[35%] relative">
          
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
