import { ReactNode, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
  FaHome,
  FaStore,
  FaInfoCircle,
  FaShoppingCart,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import Modal from "@/Components/Login/Modal";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";
import { DarkModeSwitch } from "react-toggle-dark-mode";

interface User {
  id: number;
  name: string;
  email: string;
}

interface MenuProps {
  url: string;
  header?: ReactNode;
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

export default function Menu({ url, header }: MenuProps) {
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

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Top Nav */}
      <nav className="relative bg-white dark:bg-[#424549]  w-full h-full max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center justify-between">
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
        <div className="flex items-center h-full ">
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
            if (name === "Profile" && !user) {
              return null; // hide profile if not logged in
            }

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

      {/* Bottom Nav */}
      <div className="relative sm:px-6 lg:px-8 w-full max-w-7xl mx-auto flex items-center justify-center">
        {header}
      </div>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onClose={cancelLogout} maxWidth="sm" closeable>
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-4">Are you sure you want to logout?</h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={cancelLogout}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
