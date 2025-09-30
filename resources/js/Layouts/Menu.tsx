import { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { FaHome, FaStore, FaInfoCircle, FaShoppingCart, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { MdPersonSearch } from "react-icons/md";

import { useDarkMode } from "@/Contexts/Layout/DarkModeContext";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { useCart } from "@/Contexts/Shop/Cart/CartContext";
import { useUser } from "@/Contexts/User/UserContext";

import { User } from "@/types/User";
import UserSelector from "@/Layouts/UserSelector";
import Login from "@/Pages/Auth/Login";
import Logout from "@/Pages/Auth/Logout";
import Modal from "@/Components/Modal/Modal";

interface MenuProps { url: string; }

const leftItems = [
  { name: "Home", routeName: "/", icon: <FaHome size={35} /> },
  { name: "Shop", routeName: "/shop", icon: <FaStore size={35} /> },
  { name: "About", routeName: "/about", icon: <FaInfoCircle size={35} /> },
];

function MenuComponent({ url }: MenuProps) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { cart } = useCart();
  const { props } = usePage<{ auth: { user: User } }>();
  const { user, setUser } = useUser();

  const logged_in_user = props.auth.user;



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
    return `relative flex items-center gap-1 px-3 py-2 font-semibold border-b-2 ${isActive ? "border-yellow-500 dark:border-[#7289da]" : "border-transparent"} ${isActive ? "text-yellow-500 dark:text-[#7289da]" : "text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da]"} hover:border-yellow-500 dark:hover:border-[#7289da] transition-colors duration-200 h-full flex-col justify-center`;
  };

  const handleLoginLogoutClick = () => {
    if (!user.is_guest) setShowLogoutModal(true);
    else setShowLoginModal(true);
  };

  const handleLogoutSuccess = () => setShowLogoutModal(false);

  const rightItems = [
    { name: "Cart", routeName: "/cart", icon: <FaShoppingCart size={35} /> },
    !user.is_guest && { name: "Profile", routeName: "/profile", icon: <FaUserCircle size={35} /> },
    { name: "Login/Logout", routeName: "/logout", icon: <FaSignOutAlt size={35} /> },
    logged_in_user.is_admin && { name: "UserSearch", icon: <MdPersonSearch size={35} /> }, // Use logged_in_user here
  ].filter(Boolean);

  return (
    <>
      <nav className="relative dark:bg-[#424549] w-full h-full max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex h-full">
          {leftItems.map(({ name, routeName, icon }) => (
            <button key={name} onClick={() => router.visit(routeName)} className={getNavItemClass(routeName)} type="button" title={name}>{icon}</button>
          ))}
        </div>

        <div className="flex items-center h-full">
          <div className="flex items-center justify-center h-full px-2">
            <DarkModeSwitch checked={darkMode} onChange={toggleDarkMode} size={35} moonColor="#7289da" sunColor="#facc15" />
          </div>

          {rightItems.map(({ name, routeName, icon }) => {
            if (name === "Cart") return (
              <button key={name} onClick={() => router.visit(routeName!)} className={getNavItemClass(routeName!)} type="button" title={name}>
                <div className="relative">
                  {icon}
                  {cartCount > 0 && <span className={`absolute -top-1 -right-2 bg-yellow-500 dark:bg-[#7289da] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-[0_0_6px_rgba(0,0,0,0.6)] transform transition-transform duration-300 ${pop ? "scale-125" : "scale-100"}`}>{cartCount}</span>}
                </div>
              </button>
            );

            if (name === "Login/Logout") return <button key={name} onClick={handleLoginLogoutClick} className={getNavItemClass(routeName!)} type="button" title={name}>{icon}</button>;

            if (name === "UserSearch") return (
              <button key={name} onClick={() => setShowUserSelector(true)} className="relative flex items-center gap-1 px-3 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-[#7289da] transition-colors duration-200 h-full flex-col justify-center" type="button" title={name}>{icon}</button>
            );

            return <button key={name} onClick={() => router.visit(routeName!)} className={getNavItemClass(routeName!)} type="button" title={name}>{icon}</button>;
          })}
        </div>
      </nav>

      <Logout show={showLogoutModal} onClose={handleLogoutSuccess} />

      <Modal show={showLoginModal} maxWidth="lg" onClose={() => setShowLoginModal(false)}>
        <Login onSuccess={() => setShowLoginModal(false)} />
      </Modal>

      <Modal show={showUserSelector} onClose={() => setShowUserSelector(false)}>
        <UserSelector onClose={() => setShowUserSelector(false)} />
      </Modal>
    </>
  );
}

export default function Menu({ url }: MenuProps) {
  return <MenuComponent url={url} />;
}
