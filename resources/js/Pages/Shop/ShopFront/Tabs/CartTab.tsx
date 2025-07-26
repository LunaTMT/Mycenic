// src/Pages/Shop/ShopFront/Tabs/CartTab.tsx
import React, { useEffect, useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import { load } from "recaptcha-v3";

import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import Breadcrumb from "@/Components/Nav/Breadcrumb";
import Item from "../../Cart/Item/Item";
import Summary from "../../Cart/Summary/Summary";

import { useCart } from "@/Contexts/Shop/Cart/CartContext";

const CartTab: React.FC = () => {
  const { auth } = usePage().props as { auth?: any };
  const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
  const { cart, hasPsyilocybinSporeSyringe } = useCart();

  const [recaptchaToken, setRecaptchaToken] = useState<string>("");

  useEffect(() => {
    load(import.meta.env.VITE_NOCAPTCHA_SITEKEY).then((recaptcha) => {
      recaptcha.execute("cart").then((token) => {
        setRecaptchaToken(token);
      });
    });
  }, []);

  return (

      <div className="relative min-h-[89vh] p-5 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex gap-10 justify-center items-start">
        <div className="w-[65%] space-y-3 p-4 flex flex-col justify-start items-center min-h-[80vh] rounded-lg bg-white/50 border border-black/20 dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 backdrop-blur-sm">
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map((item, index) => <Item key={index} item={item} />)
          )}
        </div>

        <div className="w-[35%] relative">
          <Summary auth={auth} />
        </div>
      </div>
    
  );
};

export default CartTab;
