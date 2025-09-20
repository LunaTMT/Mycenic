import { useState } from "react";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useShop } from "@/Contexts/Shop/ShopContext";

const SortDropdown = () => {
  const { setSortOption } = useShop();
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Newest");

  const handleSelect = (label: string, value: string) => {
    setSortOption(value);
    setSelectedOption(label);
    setOpen(false);
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
    <div className="mb-4 flex-1 relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
        Sort
      </label>

      <Dropdown onOpenChange={setOpen}>
        <Dropdown.Trigger>
          <div className="w-40 px-3 py-1 border rounded-md text-left cursor-pointer flex justify-between items-center text-sm text-gray-900 dark:text-white dark:bg-[#424549]/80 border-black/20 dark:border-white/20">
            <span className="truncate">{selectedOption}</span>
            <ArrowIcon w="16" h="16" isOpen={open} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <ul className="w-40 bg-white dark:bg-[#424549] shadow-lg z-50 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
            {menuItems.map((item, i) => (
              <li
                key={item.label}
                onClick={() => handleSelect(item.label, item.value)}
                className={`px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-[#7289da]/70 ${
                  selectedOption === item.label ? "font-semibold" : ""
                } ${i === 0 ? "rounded-t-md" : ""} ${i === menuItems.length - 1 ? "rounded-b-md" : ""}`}
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
