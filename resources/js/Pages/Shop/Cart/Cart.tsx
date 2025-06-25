import { load } from 'recaptcha-v3';
import React, { useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";

import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import Breadcrumb from "@/Components/Nav/Breadcrumb";
import Item from "./Item/Item";
import Summary from "./Summary/Summary";

import { ToastContainer } from "react-toastify";
import { ShippingDetails, useCart } from "@/Contexts/Shop/Cart/CartContext";

interface CartProps {
  auth: any;
  shippingDetails?: ShippingDetails;
}

const Cart: React.FC<CartProps> = ({ auth }) => {
  const Layout = auth ? AuthenticatedLayout : GuestLayout;
  const { cart, shippingDetails, hasPsyilocybinSporeSyringe } = useCart();

  const [agreed, setAgreed] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const showLegalNotice = hasPsyilocybinSporeSyringe;

  useEffect(() => {
    load(import.meta.env.VITE_NOCAPTCHA_SITEKEY).then((recaptcha) => {
      recaptcha.execute('cart').then((token) => {
        setRecaptchaToken(token);
      });
    });
  }, []);

  return (
    <Layout
      header={
        <div className="h-[5vh] z-20 w-full overflow-visible flex justify-between items-center gap-4">
          <Breadcrumb items={[{ label: "SHOP", link: route("shop") }, { label: "CART" }]} />
        </div>
      }
    >
      <Head title="Cart" />

      <div className='w-full h-full'>
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
        >
          <source src="/assets/videos/time_lapse.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

      </div>


      <div className="relative min-h-[89vh] mx-auto w-full max-w-7xl sm:px-6 lg:px-8 p-5 flex gap-10 justify-center items-start ">
        
        {/* Content */}
        <div className="w-[65%] space-y-3 p-4 flex flex-col justify-start items-center min-h-[80vh] rounded-lg bg-white/50  border border-black/20 dark:bg-[#424549]/80 dark:border-white/20 text-gray-800 dark:text-gray-200 backdrop-blur-sm">
          {cart.map((item, index) => (
            <Item key={index} item={item} />
          ))}
        </div>

        <div className="w-[35%] relative">
          <Summary auth={auth} />
        </div>
      </div>

    </Layout>
  );
};

export default Cart;
