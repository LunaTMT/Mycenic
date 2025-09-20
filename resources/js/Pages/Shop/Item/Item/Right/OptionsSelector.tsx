import React, { useState } from "react";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import Dropdown from "@/Components/Dropdown/Dropdown";

const OptionsSelector: React.FC = () => {
  const { item, options, selectedOptions, setSelectedOptions } = useItemContext();
  const [openDropdownLabel, setOpenDropdownLabel] = useState<string | null>(null);

  const handleSelect = (label: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [label]: value }));
    setOpenDropdownLabel(null);
  };

  if (!item) return null;

  return (
    <div className="flex gap-6 items-center">
      {Object.entries(options).map(([label, values]) => {
        const selectedValue = selectedOptions[label] || null;

        return (
          <div key={label} className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              {label}
            </label>

            <Dropdown
              items={values.map((v) => ({ id: v, label: v }))}
              selectedItemId={selectedValue}
              onSelect={(value) => handleSelect(label, value)}
              placeholder={`Select ${label}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default OptionsSelector;
