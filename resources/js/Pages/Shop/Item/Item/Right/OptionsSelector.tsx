import React, { useState } from "react";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import Dropdown from "@/Components/Dropdown/Dropdown";

const OptionsSelector: React.FC = () => {
  const { item, options, selectedOptions, setSelectedOptions } = useItemContext();
  const [openDropdownLabel, setOpenDropdownLabel] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const handleDropdownStateChange = (label: string, isOpen: boolean) => {
    setOpenDropdownLabel(isOpen ? label : null);
  };

  const handleSelect = (label: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [label]: value }));
    setOpenDropdownLabel(null);
  };

  if (!item) return null;

  return (
    <div className="flex gap-6 items-center">
      {/* ✅ Option selectors */}
      {Object.entries(options).map(([label, values]) => {
        const isOpen = openDropdownLabel === label;

        return (
          <Dropdown key={label} onOpenChange={(isOpen) => handleDropdownStateChange(label, isOpen)}>
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                {label}
              </label>

              <Dropdown.Trigger>
                <div className=" px-4 py-2 w-50 text-gray-900 dark:text-white border dark:bg-[#424549]/80 border-black/20 dark:border-white/20 rounded-md text-left cursor-pointer flex justify-between items-center">
                  <span>{selectedOptions[label] || `Select ${label}`}</span>
                  <ArrowIcon w="16" h="16" isOpen={isOpen} />
                </div>
              </Dropdown.Trigger>

              <Dropdown.Content>
                <ul className="relative w-50 text-right  bg-white dark:bg-[#424549] shadow-lg z-50 rounded-md border border-gray-300 dark:border-gray-600">
                  {values.map((value, i) => {
                    const isFirst = i === 0;
                    const isLast = i === values.length - 1;

                    return (
                      <li
                        key={i}
                        onClick={() => handleSelect(label, value)}
                        className={`cursor-pointer px-4 py-2 font-Poppins text-sm 
                          hover:bg-gray-400 dark:hover:bg-[#7289da]/70 
                          text-gray-800 dark:text-gray-200 ${
                            selectedOptions[label] === value ? "font-semibold" : ""
                          } ${isFirst ? "rounded-t-md" : ""} ${isLast ? "rounded-b-md" : ""}`}
                      >
                        {value}
                      </li>
                    );
                  })}
                </ul>
              </Dropdown.Content>
            </div>
          </Dropdown>
        );
      })}
    </div>
  );
};

export default OptionsSelector;
