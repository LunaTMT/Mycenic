import React, { useState } from "react";
import ArrowIcon from "@/Components/Buttons/ArrowButton";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";


const OptionsSelector: React.FC = () => {
  const { options, selectedOptions, setSelectedOptions } = useItemContext();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  return (
    <div className="flex gap-6">
      {Object.entries(options).map(([label, values]) => {
        const isOpen = openDropdowns[label] || false;

        const toggleDropdown = () => {
          setOpenDropdowns((prev) => ({
            ...Object.fromEntries(Object.keys(prev).map((k) => [k, false])),
            [label]: !isOpen,
          }));
        };

        const handleSelect = (value: string) => {
          setSelectedOptions((prev) => ({ ...prev, [label]: value }));
          setOpenDropdowns((prev) => ({ ...prev, [label]: false }));
        };

        return (
          <div key={label} className="mb-4 flex-1 relative ">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">{label}</label>

            <button
              type="button"
              onClick={toggleDropdown}
              className="w-full px-4 py-2 text-gray-900 dark:text-white border rounded-lg dark:bg-[#424549]/80 border-black/20 dark:border-white/20 rounded-md text-left cursor-pointer flex justify-between items-center"
            >
              <span>{selectedOptions[label] || `Select ${label}`}</span>
              <ArrowIcon w="16" h="16" isOpen={isOpen} />
            </button>

            {isOpen && (
              <div className="absolute z-50 w-full bg-white dark:bg-[#424549] border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                <ul className="text-sm text-gray-700 dark:text-white">
                  {values.map((value, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelect(value)}
                      className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#7289da] cursor-pointer ${
                        selectedOptions[label] === value ? "font-semibold" : ""
                      }`}
                    >
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OptionsSelector;
