import { useState } from 'react';
import { Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown/Dropdown';
import ArrowIcon from '@/Components/Buttons/ArrowButton';

const categories = [
  "All", "Agar", "Apparel", "Books", "Equipment", "Foraging", "Gourmet",
  "Grow kits", "Infused", "Microscopy", "Spawn", "Spores"
];

interface FilterButtonProps {
  currentCategory?: string;
}

const FilterButton = ({ currentCategory }: FilterButtonProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleDropdownStateChange = (isOpen: boolean) => {
    setShowDropdown(isOpen);
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
            <p className="font-Poppins  hover:text-black dark:text-white/70 dark:hover:text-white">
              FILTER
            </p>
            <ArrowIcon w="30" h="30" isOpen={showDropdown} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <ul className="relative  text-right w-full bg-white dark:bg-[#424549] shadow-lg  z-50">
            {categories.map((category, index) => (
              <li
                key={category}
                className={`cursor-pointer px-4 py-2 font-Poppins hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70 text-gray-700 dark:text-gray-300
                 `}
              >
                <Link
                  href={`/shop?category=${encodeURIComponent(category.toUpperCase())}`}
                  className="block w-full"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
};

export default FilterButton;
