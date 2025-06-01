import { MdAccountBox } from "react-icons/md";
import Dropdown from '@/Components/Dropdown/Dropdown';
import { Inertia } from '@inertiajs/inertia';

const AccountDropdown = () => {

    const menuItems = [
        { label: "Profile", onClick: () => Inertia.get('/profile') },
        { label: "Orders", onClick: () => Inertia.get('/orders') },
        { label: "Returns", onClick: () => Inertia.get('/returns') },
        { label: "Log out", onClick: () => Inertia.post('/logout', {}, { preserveScroll: true }) },
    ];

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <MdAccountBox className="w-10 h-10 mt-1 text-black hover:text-black hover:scale-110 dark:text-slate-300 dark:hover:text-white transition-transform duration-500" />
            </Dropdown.Trigger>

            <Dropdown.Content>
                <ul className="relative text-right w-full -mt-1 bg-white dark:bg-[#424549] shadow-lg z-50">
                    {menuItems.map((item, index) => (
                        <li
                            key={index}
                            className="cursor-pointer px-4 py-2 font-Poppins hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70 text-gray-700 dark:text-gray-300"
                            onClick={item.onClick}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            </Dropdown.Content>
        </Dropdown>
    );
};

export default AccountDropdown;
