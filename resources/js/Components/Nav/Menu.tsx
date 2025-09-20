import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import Hamburger from 'hamburger-react';

// Define the type for navigation items
interface NavItem {
  id: number;
  text: string;
  url: string;
  className: string;
}

interface MenuProps {
  className?: string;
}

const Menu: React.FC<MenuProps> = ({ className }) => {
  const [nav, setNav] = useState<boolean>(false);
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [hoveringIndex, setHoveringIndex] = useState<number | null>(null);

  const navItems: NavItem[] = [
    { id: 1, text: "Home", url: "/", className: "" },
    { id: 2, text: "Shop", url: "/shop", className: "" },
    { id: 3, text: "About", url: "/about", className: "" },
    { id: 4, text: "Contact", url: "/contact", className: "" },
    { id: 5, text: "Resources", url: "/resources", className: "" }
  ];

  const handleNav = () => setNav((prev) => !prev);

  useEffect(() => {
    console.log(`Nav state changed: ${nav}`);
  }, [nav]);

  return (
    <div
      className={`absolute flex justify-center items-center 
        w-full h-[10vh]  z-50 text-white ${className || ""}`}
    >
      {/* Desktop Navigation */}
      <motion.ul
        className="hidden md:flex z-50 font-Aileron_Thin"
        initial={{ opacity: 0, y: -100, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 2 }}
      >
        {navItems.map((item, index) => (
          <motion.li
            key={item.id}
            className="relative m-4 px-4 py-1 cursor-pointer group font-Aeleron_Thin text-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onMouseEnter={() => setHoveringIndex(index)}
            onMouseLeave={() => setHoveringIndex(null)}
          >
            <a href={item.url} className="text-white">
              {item.text}
            </a>
            <motion.div
              animate={{ width: hoveringIndex === index ? "100%" : "0%" }}
              className={`absolute left-0 bottom-0 h-[2px] rounded-full
                bg-white bg-gradient-to-r from-sky-500 to-white ${
                  hoveringIndex === index
                    ? "shadow-[0_0_20px_5px_rgba(0,182,255,0.6)]"
                    : ""
                }`}
              transition={{ duration: 0.5 }}
            />
          </motion.li>
        ))}
      </motion.ul>

      {/* Mobile Navigation Icon */}
      <motion.div
        onClick={handleNav}
        className={`fixed top-0 right-0 m-4 md:hidden transition-all duration-1000 z-50 bg-transparent`}
        initial={{ opacity: 1 }}
        animate={{ opacity: isVisible ? 1 : 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <Hamburger toggled={isOpen} toggle={setOpen} color={isOpen ? "black" : "white"} />
      </motion.div>

      {/* Mobile Navigation Menu */}
      <motion.ul
        initial={{ x: "-100%" }}
        animate={{ x: nav ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`
          fixed left-0 top-0 w-full h-auto 
          bg-white bg-gradient-to-r from-sky-500 to-white
          pt-10 flex flex-col justify-center items-center
          md:hidden`}
      >
        {navItems.map((item) => (
          <motion.li
            key={item.id}
            className="w-[90%] relative p-4 cursor-pointer group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: item.id * 0.1 }}
          >
            {item.text}
            <motion.div
              className="absolute left-0 bottom-0 h-[2px] bg-white w-0 group-hover:w-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

export default Menu;

