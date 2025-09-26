import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
  FaHome,
  FaStore,
  FaInfoCircle,
  FaShoppingCart,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdPersonSearch } from "react-icons/md";

import Modal from "@/Components/Modal/Modal";
import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";
import { DarkModeSwitch } from "react-toggle-dark-mode";

import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { useUser } from "@/Contexts/UserContext";
import UserSelector from "@/Pages/Profile/Components/UserSelector";
import Login from "@/Pages/Auth/Login/Login";

interface User {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
}

interface MenuProps {
  url: string;
}

const leftItems = [
  { name: "Home", routeName: "/", icon: <FaHome size={35} /> },
  { name: "Shop", routeName: "/shop", icon: <FaStore size={35} /> },
  { name: "About", routeName: "/about", icon: <FaInfoCircle size={35} /> },
];

function MenuComponent({ url }: MenuProps) {
  const { auth } = usePage<{ auth?: { user?: User } }>().props;
  const user = auth?.user;

  const { darkMode, toggleDarkMode } = useDarkMode();
  const { cart } = useCart();
  const { logout } = useUser();

  const cartCount = (cart?.items ?? []).reduce((acc, item) => acc + item.quantity, 0);

  const [pop, setPop] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setPop(true);
      const timeout = setTimeout(() => setPop(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [cartCount]);

  const getNavItemClass = (routeName: string) => {
    const isActive = url === routeName;
    return `relative flex items-center gap-1 px-3 py-2 font-semibold
      border-b-2 ${isActive ? "border-yellow-500 dark:border-[#7289da]" : "border-transparent"}
      ${isActive ? "text-yellow-500 dark:text-[#7289da]" : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"}
      hover:border-yellow-500 dark:hover:border-[#7289da]
      transition-colors duration-200
      h-full
      flex-col
      justify-center
    `;
  };

  const handleLoginLogoutClick = () => {
    if (user) {
      setShowLogoutModal(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.visit("/", { preserveState: false });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const rightItems = [
    { name: "Cart", routeName: "/cart", icon: <FaShoppingCart size={35} /> },
    user ? { name: "Profile", routeName: "/profile", icon: <FaUserCircle size={35} /> } : null,
    { name: "Login/Logout", routeName: "/logout", icon: <FaSignOutAlt size={35} /> },
    user?.is_admin ? { name: "UserSearch", icon: <MdPersonSearch size={35} /> } : null,
  ].filter(Boolean);

  return (
    <>
      <nav className="relative dark:bg-[#424549] w-full h-full max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center justify-between">
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

        <div className="flex items-center h-full">
          <div className="flex items-center justify-center h-full px-2">
            <DarkModeSwitch
              checked={darkMode}
              onChange={toggleDarkMode}
              size={35}
              moonColor="#7289da"
              sunColor="#facc15"
            />
          </div>

          {rightItems.map(({ name, routeName, icon }) => {
            if (name === "Cart") {
              return (
                <button
                  key={name}
                  onClick={() => router.visit(routeName!)}
                  className={getNavItemClass(routeName!)}
                  type="button"
                  title={name}
                >
                  <div className="relative">
                    {icon}
                    {cartCount > 0 && (
                      <span
                        className={`absolute -top-1 -right-2 
                          bg-yellow-500 dark:bg-[#7289da] 
                          text-white text-xs font-bold rounded-full 
                          h-5 w-5 flex items-center justify-center 
                          shadow-[0_0_6px_rgba(0,0,0,0.6)]
                          transform transition-transform duration-300
                          ${pop ? "scale-125" : "scale-100"}
                        `}
                      >
                        {cartCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            }

            if (name === "Login/Logout") {
              return (
                <button
                  key={name}
                  onClick={handleLoginLogoutClick}
                  className={getNavItemClass(routeName!)}
                  type="button"
                  title={name}
                >
                  {icon}
                </button>
              );
            }

            if (name === "UserSearch") {
              return (
                <button
                  key={name}
                  onClick={() => setShowUserSelector(true)}
                  className="relative flex items-center gap-1 px-3 py-2 font-semibold
                    text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]
                    transition-colors duration-200
                    h-full
                    flex-col
                    justify-center
                  "
                  type="button"
                  title={name}
                >
                  {icon}
                </button>
              );
            }

            // Default for other items with routeName
            return (
              <button
                key={name}
                onClick={() => router.visit(routeName!)}
                className={getNavItemClass(routeName!)}
                type="button"
                title={name}
              >
                {icon}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Modal */}
      <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="p-4 space-y-4 text-center max-w-lg w-full mx-auto">
          <h2 className="text-2xl font-semibold">Are you sure you want to logout?</h2>
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

      {/* Login Modal */}
      <Modal show={showLoginModal} maxWidth="md" onClose={() => setShowLoginModal(false)}>
        <Login />
      </Modal>

      {/* User Selector Modal */}
      <Modal show={showUserSelector} onClose={() => setShowUserSelector(false)}>
        <UserSelector onClose={() => setShowUserSelector(false)} />
      </Modal>
    </>
  );
}

// -------- Wrap Menu with CartProvider --------
export default function Menu({ url }: MenuProps) {
  return <MenuComponent url={url} />;
}
