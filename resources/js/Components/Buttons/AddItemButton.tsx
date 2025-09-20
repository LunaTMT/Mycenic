import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { IoIosAddCircleOutline } from "react-icons/io";

const AddItemButton: React.FC = () => {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role;

    return (
        userRole === 'admin' && (
            <Link href={route('item.add')}>
                <div className="cursor-pointer flex items-center justify-center gap-2 rounded-md relative group">
                    <p className="font-Poppins text-slate-700 hover:text-black  dark:text-white/70 dark:hover:text-white transition-transform duration-300 ">
                        ADD
                    </p>
                    <IoIosAddCircleOutline className="cursor-pointer w-8 h-8 rounded-md text-black dark:text-white transition-transform duration-300 group-hover:rotate-180" />
                </div>
            </Link>
        )
    );
};

export default AddItemButton;