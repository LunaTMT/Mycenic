import React, { useState } from "react";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "@/Components/Buttons/ArrowIcon";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Liked", value: "most_liked" },
  { label: "Least Liked", value: "least_liked" },
];

interface SortByDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function SortByDropdown({ sortBy, onSortChange }: SortByDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
      onClick={() => setShowDropdown((prev) => !prev)}
    >
      <Dropdown onOpenChange={setShowDropdown}>
        <Dropdown.Trigger>
          <div className="flex items-center gap-2 cursor-pointer">
            <p className="font-Poppins text-sm text-gray-700 dark:text-white/70 hover:text-black dark:hover:text-white">
              Sort By:{" "}
              <span className="font-semibold text-yellow-600 dark:text-[#7289da] capitalize">
                {sortOptions.find((o) => o.value === sortBy)?.label || "Sort"}
              </span>
            </p>
            <ArrowIcon w="20" h="20" isOpen={showDropdown} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <ul className="text-right bg-white dark:bg-[#424549] shadow-lg z-50 w-48 rounded-md overflow-hidden">
            {sortOptions.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-2 cursor-pointer text-sm font-Poppins text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#7289da]/70 ${
                  sortBy === option.value ? "font-semibold text-yellow-600 dark:text-[#7289da]" : ""
                }`}
                onClick={() => {
                  onSortChange(option.value);
                  setShowDropdown(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
}
