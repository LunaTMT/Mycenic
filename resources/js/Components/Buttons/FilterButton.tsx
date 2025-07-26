import { useState } from "react";
import { useShop } from "@/Contexts/Shop/ShopContext";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "../Icon/ArrowIcon";

const FilterButton = () => {
  const [open, setOpen] = useState(false);
  const { category, setCategory, availableCategories } = useShop();

  return (
    <div className="mb-4 flex-1 relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
        Category
      </label>

      <Dropdown onOpenChange={setOpen}>
        <Dropdown.Trigger>
          <div className="w-40 px-3 py-1 border rounded-md text-left cursor-pointer flex justify-between items-center text-sm text-gray-900 dark:text-white dark:bg-[#424549]/80 border-black/20 dark:border-white/20">
            <span>{category || "Select Category"}</span>
            <ArrowIcon w="16" h="16" isOpen={open} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <ul className="w-40 bg-white dark:bg-[#424549] shadow-lg z-50 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
            {availableCategories.map((cat, i) => (
              <li
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-[#7289da]/70 ${
                  category === cat ? "font-semibold" : ""
                } ${i === 0 ? "rounded-t-md" : ""} ${i === availableCategories.length - 1 ? "rounded-b-md" : ""}`}
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
