import { useState } from "react";
import { useShop } from "@/Contexts/Shop/ShopContext";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "../Icon/ArrowIcon";

const FilterButton = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { category, setCategory, availableCategories } = useShop();

  const handleDropdownStateChange = (isOpen: boolean) => {
    setShowDropdown(isOpen);
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowDropdown(false);
  };

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
              FILTER
            </p>
            <ArrowIcon w="30" h="30" isOpen={showDropdown} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <ul className="relative text-right w-fit bg-white dark:bg-[#424549] shadow-lg z-50">
            {availableCategories.map((cat) => (
              <li
                key={cat}
                className={`cursor-pointer px-4 py-2 font-Poppins text-sm hover:bg-gray-200 dark:hover:bg-[#7289da]/70 text-gray-800 dark:text-gray-200
                  
                  ${cat === category ? "font-bold" : ""}
                `}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
};

export default FilterButton;
