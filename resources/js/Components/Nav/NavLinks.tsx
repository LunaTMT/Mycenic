import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import sections from '@/Pages/About/Section';

// Define your top-level navigation items
const navItems = [
  { name: 'HOME', routeName: '/' },
  { name: 'SHOP', routeName: '/shop' },
  { name: 'ABOUT', routeName: '/about' }
];

interface NavLinksProps {
  currentUrl: string;
}

const dropdownVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1 },
};

const NavLinks: React.FC<NavLinksProps> = ({ currentUrl }) => {


  const handleLinkClick = (route: string) => {
    Inertia.get(route);
  };



 

  return (
    <>
      <div className="flex gap-8 mt-2 h-full   w-full justify-left items-center font-Audrey leading-none text-2xl">
        {navItems.map(item => (
          <div
            key={item.routeName}
            className="relative group cursor-pointer"
            onClick={() => handleLinkClick(item.routeName)}
          >
            <span className="text-shadow-beige-glow">{item.name}</span>
            <span
              className={`absolute left-0 bottom-0 h-[1px] bg-gradient-to-r rounded-full
                from-yellow-400/50 via-yellow-400 to-yellow-400/50
                dark:from-slate-700 dark:via-white dark:to-slate-700
                transition-all duration-300 ${currentUrl === item.routeName ? 'w-full' : 'w-0 group-hover:w-full'}`}
            />
          </div>
        ))}
      </div>


    </>
  );
};

export default NavLinks;
