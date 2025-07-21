import { PropsWithChildren, ReactNode, useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useNav } from "@/Contexts/Layout/NavContext";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";

import NavLinks from "@/Components/Nav/NavLinks";
import CartButton_Dropdown from '@/Layouts/CartButton_Dropdown';
import { DarkModeSwitch } from "react-toggle-dark-mode";
import ScrollTop from "@/Components/Buttons/ScrollToTopButton";
import { ToastContainer, toast } from "react-toastify";
import Modal from "@/Components/Login/Modal";

import { FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

interface PageProps {
  auth: {
    user?: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
  flash?: {
    success?: string;
    error?: string;
    message?: string;
  };
  url: string;
}

type AuthenticatedProps = PropsWithChildren<{
  header?: ReactNode;
}>;

export default function Authenticated({ header, children }: AuthenticatedProps) {
  const { auth, flash, url } = usePage<PageProps>().props;
  const safeUrl = url ?? "";
  const user = auth.user;

  const { scrollDirection } = useNav();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { scaled, cart, totalItems } = useCart();

  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleLogout = () => {
    router.post("/logout");
    setShowLogoutModal(false);
  };

  return (
    <div className="relative w-full min-h-screen dark:bg-[#424549]">
      <motion.header
        className="sticky top-0 z-20 w-full max-h-[11vh] bg-white shadow-xl dark:bg-[#424549] dark:text-white border-b border-black/20 dark:border-white/20"
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileInView={{
          y: scrollDirection === "down" ? "-6vh" : "0",
        }}
        viewport={{ once: true }}
      >
        {/* Top Nav */}
        <nav className="relative w-full h-[6vh] gap-0 max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center justify-center">
          {/* Left */}
          <NavLinks currentUrl={url} />

          {/* Right */}
          <div className="h-full flex items-center gap-3">
            <div className="transform hover:scale-110 transition-transform duration-500">
              <DarkModeSwitch
                checked={darkMode}
                onChange={toggleDarkMode}
                size={28}
                moonColor={darkMode ? "white" : "rgb(253, 230, 138)"}
                sunColor={darkMode ? "black" : "rgb(252, 211, 77)"}
                className="mt-1"
              />
            </div>

            <CartButton_Dropdown cart={cart} totalItems={totalItems} scaled={scaled} />

            {user && (
              <>
                <a
                  href="/profile"
                  title="Profile"
                  className="w-8 h-8 mt-1 text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500"
                >
                  <FaUserCircle className="w-full h-full" />
                </a>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  title="Log out"
                  className="w-8 h-8 mt-1 text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500"
                >
                  <FiLogOut className="w-full h-full" />
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Bottom Nav */}
        <div className="relative sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex items-center justify-center">
          {header}
        </div>
      </motion.header>

      <main className={`relative w-full min-h-screen h-full dark:bg-[#1e2124]`}>
        {children}
      </main>

      <ScrollTop />

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

      <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="p-6 space-y-4 text-center">
          <h2 className="text-xl font-semibold">Confirm Logout</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to log out?
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Log out
            </button>
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
