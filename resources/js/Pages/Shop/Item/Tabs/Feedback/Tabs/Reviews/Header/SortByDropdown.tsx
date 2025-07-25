import React, { useState } from "react";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Liked", value: "most_liked" },
  { label: "Least Liked", value: "least_liked" },
];

export default function SortByDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { sortBy, handleSortChange } = useReviews();

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
      onClick={() => setShowDropdown((prev) => !prev)}
    >
      <Dropdown onOpenChange={setShowDropdown}>
        <Dropdown.Trigger>
          <div className="flex items-center gap-2 cursor-pointer justify-center">
            <p className="font-Poppins text-sm hover:text-black dark:text-white/70 dark:hover:text-white">
              Sort By:{" "}
              <span className="font-semibold text-yellow-600 dark:text-[#7289da] capitalize">
                {sortOptions.find((o) => o.value === sortBy)?.label || "Sort"}
              </span>
            </p>
            <ArrowIcon w="25" h="25" isOpen={showDropdown} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <ul className="relative w-full text-right bg-white dark:bg-[#424549] shadow-lg z-50">
            {sortOptions.map((option) => (
              <li
                key={option.value}
                className={`cursor-pointer px-4 py-2 font-Poppins hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70 text-gray-700 dark:text-gray-300 ${
                  sortBy === option.value
                    ? "font-semibold text-yellow-600 dark:text-[#7289da]"
                    : ""
                }`}
                onClick={() => {
                  handleSortChange(option.value);
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
