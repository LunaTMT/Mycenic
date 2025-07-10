import { useState } from "react";
import Dropdown from '@/Components/Dropdown/Dropdown';
import ArrowIcon from "@/Components/Buttons/ArrowButton";
import { useShop } from "@/Contexts/Shop/ShopContext";
import { Inertia } from "@inertiajs/inertia";

const FilterDropdown = () => {
    const { filterVisible } = useShop();

    const getCategoryFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("category")?.toUpperCase() || "ALL";
    };

    const [selectedCategory, setSelectedCategory] = useState<string>(getCategoryFromUrl());
    const [showDropdown, setShowDropdown] = useState(false);

    const categories = [
        "All", "Agar", "Apparel", "Books", "Equipment", "Foraging", "Gourmet",
        "Grow kits", "Infused", "Microscopy", "Spawn", "Spores"
    ];

    const handleDropdownStateChange = (isOpen: boolean) => {
        setShowDropdown(isOpen);
    };

    const handleCategorySelect = (category: string) => {
        const upper = category.toUpperCase();
        setSelectedCategory(upper);
        Inertia.get(route("shop"), { category: upper, filterVisible }, { preserveState: true });
        setShowDropdown(false);
    };

    const menuItems = categories.map((category) => ({
        label: category,
        onClick: () => handleCategorySelect(category)
    }));

    return (
        <Dropdown onOpenChange={handleDropdownStateChange}>
            <Dropdown.Trigger>
                <div className="flex justify-center items-center gap-2">
                    <p className="font-Poppins hover:text-black dark:text-white/70 dark:hover:text-white">
                        FILTER
                    </p>
                    <ArrowIcon w="30" h="30" isOpen={showDropdown} />
                </div>
            </Dropdown.Trigger>

            <Dropdown.Content>
                    <ul className="relative text-right w-full bg-red-400 dark:bg-[#424549] shadow-lg  z-50">
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
    );
};

export default FilterDropdown;
