import React, { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";

import GuestLayout from "@/Layouts/GuestLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import Left from "./Left/Left";
import Right from "./Right/Right";

const Cart: React.FC = () => {
  const { auth } = usePage().props as { auth?: { user?: User } };
  const Layout = auth ? AuthenticatedLayout : GuestLayout;


  return (
    <Layout>
      <Head title="Cart" />

      <div className="relative min-h-[89vh] p-5 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex gap-10 justify-center items-start">
        <Left  />
        <Right  />
      </div>
    </Layout>
  );
};

export default Cart;
