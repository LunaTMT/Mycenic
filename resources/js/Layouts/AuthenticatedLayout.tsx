import { PropsWithChildren, ReactNode, useState, useEffect } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useNav } from "@/Contexts/NavContext";
import { useDarkMode } from "@/Contexts/DarkModeContext";
import { useCart } from "@/Contexts/CartContext";

import NavLinks from "@/Components/Nav/NavLinks";
import AboutSidebar from "@/Layouts/AboutSidebar";

import CartButton_Dropdown from '@/Layouts/CartButton_Dropdown';
import LoginButton from "@/Components/Buttons/LoginButton";
import { DarkModeSwitch } from "react-toggle-dark-mode";

import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import AccountDropdown from "@/Components/Dropdown/AccountDropdown";
import ScrollTop from "@/Components/Buttons/ScrollToTopButton";

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

    useEffect(() => {
        setMounted(true);   
    }, []);
    
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // 👇 Add this block below the flash useEffect
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
        <div className="relative w-full min-h-screen dark:bg-[#424549] ">
            <motion.header
                className="sticky top-0 z-20 w-full max-h-[11vh]  bg-white shadow-xl dark:bg-[#424549] dark:text-white border-b border-black/20 dark:border-white/20"
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileInView={{
                    y: scrollDirection === "down" ? "-6vh" : "0",
                }}
                viewport={{ once: true }}
            >
                {/* Top Nav */}
                <nav className="relative w-full h-[6vh] gap-0 max-w-7xl mx-auto sm:px-6 lg:px-8  flex items-center justify-center">
                    {/* Left */}
                    <NavLinks  currentUrl={url} />

                    
                    {/* Right */}
                    <div className="h-full  flex items-center  gap-3">
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
                        <AccountDropdown />
                    </div>
                </nav>

                {/* Bottom Nav */}
                <div className="relative  sm:px-6 lg:px-8 w-full   max-w-7xl mx-auto  flex items-center justify-center">
                    {header}
                </div>
            </motion.header>

            {/* ✅ About Sidebar (conditionally rendered inside layout) */}
            <AboutSidebar currentUrl={url} onNavigate={router.get}  />

            <main
                className={`relative w-full min-h[89vh] h-full dark:bg-[#1e2124] ${
                    safeUrl.includes("about") ? "" : ""
                }`}
            >
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
                theme={darkMode ? "dark" : "light"} // optional: match dark mode
                style={{ zIndex: 100 }}
                />
        </div>
    );
}
