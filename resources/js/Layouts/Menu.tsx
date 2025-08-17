import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
  FaHome,
  FaStore,
  FaInfoCircle,
  FaShoppingCart,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import Modal from "@/Components/Modal/Modal";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";
import { DarkModeSwitch } from "react-toggle-dark-mode";

import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";

interface User {
  id: number;
  name: string;
  email: string;
}

interface MenuProps {
  url: string;
}

const leftItems = [
  { name: "Home", routeName: "/", icon: <FaHome size={35} /> },
  { name: "Shop", routeName: "/shop", icon: <FaStore size={35} /> },
  { name: "About", routeName: "/about", icon: <FaInfoCircle size={35} /> },
];

const rightItems = [
  { name: "Cart", routeName: "/cart", icon: <FaShoppingCart size={35} /> },
  { name: "Profile", routeName: "/profile", icon: <FaUserCircle size={35} /> },
  { name: "Logout", routeName: "/logout", icon: <FaSignOutAlt size={35} /> },
];

export default function Menu({ url }: MenuProps) {
  const { auth } = usePage<{ auth?: { user?: User } }>().props;
  const user = auth?.user;

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const getNavItemClass = (routeName: string) => {
    const isActive = url === routeName;
    return `flex items-center gap-1 px-3 py-2 font-semibold
      border-b-2 ${isActive ? "border-yellow-500 dark:border-[#7289da]" : "border-transparent"}
      ${isActive ? "text-yellow-500 dark:text-[#7289da]" : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"}
      hover:border-yellow-500 dark:hover:border-[#7289da]
      transition-colors duration-200
      h-full
      flex-col
      justify-center
    `;
  };

  const handleLogoutClick = () => {
    if (user) {
      setShowLogoutModal(true);
    } else {
      router.visit("/login");
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router.post("/logout");
  };

  return (
    <>
      {/* Top Nav */}
      <nav className="relative bg-white dark:bg-[#424549] w-full h-full max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Items */}
        <div className="flex h-full">
          {leftItems.map(({ name, routeName, icon }) => (
            <button
              key={name}
              onClick={() => router.visit(routeName)}
              className={getNavItemClass(routeName)}
              type="button"
              title={name}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Right Items */}
        <div className="flex items-center h-full">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-center h-full px-2">
            <DarkModeSwitch
              checked={darkMode}
              onChange={toggleDarkMode}
              size={35}
              moonColor="#7289da"
              sunColor="#facc15"
            />
          </div>

          {/* Other Right Items */}
          {rightItems.map(({ name, routeName, icon }) => {
            if (name === "Profile" && !user) return null;

            if (name === "Logout") {
              return (
                <button
                  key={name}
                  onClick={handleLogoutClick}
                  className={getNavItemClass(routeName)}
                  type="button"
                  title={name}
                >
                  {icon}
                </button>
              );
            }

            return (
              <button
                key={name}
                onClick={() => router.visit(routeName)}
                className={getNavItemClass(routeName)}
                type="button"
                title={name}
              >
                {icon}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="p-4 space-y-4 text-center max-w-lg w-full mx-auto">
          <h2 className="text-2xl font-semibold">Confirm Logout</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to log out?
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <PrimaryButton className="p-2 px-6" onClick={confirmLogout}>
              Log out
            </PrimaryButton>
            <SecondaryButton className="p-2 px-6" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </SecondaryButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
