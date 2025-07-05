import React from 'react';
import { Inertia } from '@inertiajs/inertia';

const navItems = [
  { name: 'HOME', routeName: '/' },
  { name: 'SHOP', routeName: '/shop' },
  { name: 'ABOUT', routeName: '/about' },
];

interface NavLinksProps {
  currentUrl: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ currentUrl }) => {
  const handleLinkClick = (route: string) => {
    Inertia.get(route);
  };

  return (
    <div className="relative w-full flex  gap-10 mt-2 justify-start items-center 0 h-full font-Audrey leading-none text-2xl">
      
        {navItems.map((item) => (
          <div
            key={item.routeName}
            className="relative group cursor-pointer"
            onClick={() => handleLinkClick(item.routeName)}
          >
            <span className="text-shadow-beige-glow">{item.name}</span>
            <span
              className={`absolute left-0 bottom-0 h-[1px] rounded-full bg-gradient-to-r 
                from-yellow-400/50 via-yellow-400 to-yellow-400/50 
                dark:from-slate-700 dark:via-white dark:to-slate-700 
                transition-all duration-300 
                ${currentUrl === item.routeName ? 'w-full' : 'w-0 group-hover:w-full'}`}
            />
          </div>
        ))}
  
    </div>
  );
};

export default NavLinks;
