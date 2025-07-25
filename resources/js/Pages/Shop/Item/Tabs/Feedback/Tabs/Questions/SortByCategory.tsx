import React, { useState } from "react";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowButton from "@/Components/Icon/ArrowIcon";
import { useQuestions } from "@/Contexts/Shop/Items/QuestionsContext";

const categoryOptions = [
  { label: "All", value: null },
  { label: "General", value: "general" },
  { label: "Shipping", value: "shipping" },
  { label: "Product", value: "product" },
];

export default function SortByCategory() {
  const [open, setOpen] = useState(false);
  const { category, setCategory } = useQuestions();

  const selectedLabel =
    categoryOptions.find((opt) => opt.value === category)?.label || "All";

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((prev) => !prev)}
    >
      <Dropdown onOpenChange={setOpen}>
        <Dropdown.Trigger>
          <div className="flex items-center gap-2 cursor-pointer">
            <p className="font-Poppins text-sm text-gray-700 dark:text-white/70 hover:text-black dark:hover:text-white">
              Category:{" "}
              <span className="font-semibold text-yellow-600 dark:text-[#7289da] capitalize">
                {selectedLabel}
              </span>
            </p>
            <ArrowButton w="20" h="20" isOpen={open} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <ul className="text-right bg-white dark:bg-[#424549] shadow-lg z-50 w-48 rounded-md overflow-hidden">
            {categoryOptions.map((option) => (
              <li
                key={option.label}
                onClick={() => {
                  setCategory(option.value);
                  setOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer text-sm font-Poppins text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#7289da]/70 ${
                  category === option.value
                    ? "font-semibold text-yellow-600 dark:text-[#7289da]"
                    : ""
                }`}
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
