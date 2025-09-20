import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { CiLogin } from 'react-icons/ci';

const TopRightNav: React.FC = () => {
    return (   
        <nav>
            <Link
                href={route('dashboard')}
                className="fixed right-[2%] top-[9%] w-10 h-auto flex items-center justify-center z-50"
            >
                <CiLogin className="w-full h-full text-white" />
            </Link>

            
        </nav>
    );
}

export default TopRightNav;
