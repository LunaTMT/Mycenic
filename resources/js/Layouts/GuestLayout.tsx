import { PropsWithChildren, ReactNode, useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useNav } from "@/Contexts/Layout/NavContext";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";

import Menu from "./Menu";
import Modal from "@/Components/Modal/Modal";
import CartSidebar from "./CartSidebar";
import { ToastContainer, toast } from "react-toastify";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";

interface PageProps {
  auth: {
    user: any;
  };
  flash: {
    success?: string;
    error?: string;
  };
}

export default function Guest({
  header,
  children,
}: PropsWithChildren<{ header?: ReactNode }>) {
  const { flash } = usePage<PageProps>().props;
  const { url } = usePage();
  const { scrollDirection } = useNav();
  const { darkMode } = useDarkMode();
  const { cartOpen, setCartOpen } = useCart();

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  useEffect(() => {
    const handleInertiaError = (event: any) => {
      const status = event.detail?.response?.status;

      if (status === 401) {
        toast.error("You must be logged in to view this page.");
        router.visit("/login");
      }

      if (status === 403) {
        toast.error("You are not authorized to access this resource.");
      }
    };

    window.addEventListener("inertia:error", handleInertiaError);
    return () => window.removeEventListener("inertia:error", handleInertiaError);
  }, []);

  return (
    <div className="relative w-full min-h-screen dark:bg-[#1e2124]">
      {/* HEADER */}
      <motion.header
        className="sticky top-0 z-20 w-full max-h-[11vh] shadow-xl bg-white dark:bg-[#424549] dark:text-white border-b border-black/20 dark:border-white/20"
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileInView={{ y: scrollDirection === "down" ? "-6vh" : "0" }}
        viewport={{ once: true }}
      >
        <Menu url={url} header={header} />
      </motion.header>

      {/* Cart Sidebar Modal */}
      <Modal show={cartOpen} onClose={() => setCartOpen(false)} maxWidth="2xl" closeable>
        <CartSidebar />
      </Modal>

      {/* MAIN CONTENT */}
      <main className="relative w-full min-h-[95vh] h-full dark:bg-[#1e2124]">
        {children}
      </main>

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme={darkMode ? "dark" : "light"}
        style={{ zIndex: 100 }}
      />
    </div>
  );
}
