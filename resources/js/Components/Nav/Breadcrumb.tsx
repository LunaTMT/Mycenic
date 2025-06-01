import React from 'react';
import { Link } from '@inertiajs/react';

interface BreadcrumbProps {
    items: { label: string, link?: string }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex items-center space-x-2 w-full h-full text-md text-gray-600 dark:text-gray-300 font-Poppins">
            {items.map((item, index) => (
                <span key={index} className="flex items-center">
                    {item.link ? (
                        <Link href={item.link} className="hover:text-blue-500">{item.label.toUpperCase()}</Link>
                    ) : (
                        <span>{item.label}</span>
                    )}
                    {index < items.length - 1 && (
                        <span className="mx-2 text-gray-400"> &gt; </span>
                    )}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumb;