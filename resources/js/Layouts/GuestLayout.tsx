import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";

import { useNav } from "@/Contexts/Layout/NavContext";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";

import Menu from "./Menu";
import Modal from "@/Components/Modal/Modal";
import CartSidebar from "./CartSidebar";
import { ToastContainer, toast } from "react-toastify";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";

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

type GuestProps = PropsWithChildren<{
  header?: ReactNode;
}>;

export default function GuestLayout({ header, children }: GuestProps) {
  const { auth, flash } = usePage<PageProps>().props;
  const { url } = usePage();
  const { scrollDirection } = useNav();
  const { darkMode } = useDarkMode();
  const { cartOpen, setCartOpen } = useCart();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    router.post("/logout", {
      onSuccess: () => {
        toast.success("Logged out successfully.");
        router.visit("/", { preserveState: false });
      },
    });
    setShowLogoutModal(false);
  };

  return (
    <div className="relative w-full min-h-screen dark:bg-[#1e2124]">
      {/* HEADER */}
      <motion.header
        className="sticky top-0 z-20 w-full h-[6vh] shadow-xl bg-white dark:bg-[#424549] dark:text-white border-b border-black/20 dark:border-white/20"
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileInView={{ y: scrollDirection === "down" ? "-6vh" : "0" }}
        viewport={{ once: true }}
      >
        <Menu url={url} header={header} />
      </motion.header>

      {/* Cart Sidebar Modal */}
     <CartSidebar />

     
      {/* Main + Sidebar Container */}
      <div className="flex w-full">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

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

      {/* Logout Modal */}
      {showLogoutModal && (
        <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Logout
            </h3>
            <div className="flex justify-end space-x-4">
              <SecondaryButton onClick={() => setShowLogoutModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton onClick={handleLogout}>Logout</PrimaryButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
