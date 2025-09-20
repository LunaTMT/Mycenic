import React from 'react';
import { Link } from '@inertiajs/react';

interface BreadcrumbProps {
  items: { label: string; link?: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav
      className="flex items-center space-x-2 w-full h-full   text-gray-600 dark:text-gray-300 font-Poppins"
      aria-label="breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center">
            {item.link && !isLast ? (
              <Link
                href={item.link}
                className="uppercase cursor-pointer border-b-2 border-transparent hover:border-yellow-500 dark:hover:border-[#7289da] transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`uppercase ${isLast ? 'font-semibold text-yellow-500 dark:text-[#7289da]' : ''}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}

            {!isLast && <span className="mx-2 text-gray-400 dark:text-gray-500">&gt;</span>}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
