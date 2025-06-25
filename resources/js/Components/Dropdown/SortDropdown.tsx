import { useState } from 'react';
import Dropdown from '@/Components/Dropdown/Dropdown';
import ArrowIcon from "@/Components/Buttons/ArrowIcon";
import { useShop } from '@/Contexts/Shop/ShopContext';

const SortDropdown = () => {
    const { setSortOption } = useShop();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSortChange = (option: string) => {
        setSortOption(option); // Update sort option via context
        setShowDropdown(false); // Close the dropdown
    };

    const handleDropdownStateChange = (isOpen: boolean) => {
        setShowDropdown(isOpen);
    };

    const menuItems = [
        { label: "Newest", onClick: () => handleSortChange("NEWEST") },
        { label: "Low - High", onClick: () => handleSortChange("LOW - HIGH") },
        { label: "High - Low", onClick: () => handleSortChange("HIGH - LOW") },
    ];

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)} // Show on hover
            onMouseLeave={() => setShowDropdown(false)} // Hide on hover leave
            onClick={() => setShowDropdown(prev => !prev)} // Toggle on click
        >
            <Dropdown onOpenChange={handleDropdownStateChange}>
                <Dropdown.Trigger>
                    <div className="flex justify-center items-center gap-2">
                        <p className="font-Poppins hover:text-black dark:text-white/70 dark:hover:text-white">
                            SORT
                        </p>
                        <ArrowIcon w="30" h="30" isOpen={showDropdown} />
                    </div>
                </Dropdown.Trigger>

                <Dropdown.Content>
                    <ul className="relative text-right w-full bg-white dark:bg-[#424549] shadow-lg  z-50">
                        {menuItems.map((item, index) => (
                            <li
                                key={index}
                                className={`cursor-pointer px-4 py-2 font-Poppins hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70 text-gray-700 dark:text-gray-300`}
                          
                                onClick={item.onClick}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
};

export default SortDropdown;
