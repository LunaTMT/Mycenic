import { useState } from 'react';
import Dropdown from '@/Components/Dropdown/Dropdown';
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useShop } from '@/Contexts/Shop/ShopContext';

const SortDropdown = () => {
    const { setSortOption } = useShop();
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedOption, setSelectedOption] = useState("Newest");

    const handleSortChange = (option: string, label: string) => {
        setSortOption(option);
        setSelectedOption(label);
        setShowDropdown(false);
    };

    const handleDropdownStateChange = (isOpen: boolean) => {
        setShowDropdown(isOpen);
    };

    const menuItems = [
        { label: "Newest", value: "NEWEST" },
        { label: "Oldest", value: "OLDEST" },
        { label: "Highest Price", value: "HIGH - LOW" },
        { label: "Lowest Price", value: "LOW - HIGH" },
        { label: "Most Popular", value: "MOST POPULAR" },
        { label: "Least Popular", value: "LEAST POPULAR" },
        { label: "Most Reviews", value: "MOST REVIEWS" },
        { label: "Least Reviews", value: "LEAST REVIEWS" },
    ];

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            onClick={() => setShowDropdown(prev => !prev)}
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
                    <ul className="relative w-35 text-right bg-white dark:bg-[#424549] shadow-lg z-50">
                        {menuItems.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSortChange(item.value, item.label)}
                                className={`cursor-pointer px-4 py-2 font-Poppins text-sm hover:bg-gray-200 dark:hover:bg-[#7289da]/70 text-gray-800 dark:text-gray-200 ${
                                    selectedOption === item.label ? "font-bold" : ""
                                }`}
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
