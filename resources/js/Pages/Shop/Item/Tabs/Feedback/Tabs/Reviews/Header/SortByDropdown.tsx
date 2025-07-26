import { useState } from "react";
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
  const { sortBy, handleSortChange } = useReviews();
  const [open, setOpen] = useState(false);

  // Find the current label for the selected sort value or fallback
  const selectedOption =
    sortOptions.find((o) => o.value === sortBy)?.label || "Sort";

  const handleSelect = (label: string, value: string) => {
    handleSortChange(value);
    setOpen(false);
  };

  return (
    <div className="flex-1 relative">


      <Dropdown onOpenChange={setOpen}>
        <Dropdown.Trigger>
          <div className="w-40 px-3 py-1 border rounded-md text-left cursor-pointer flex justify-between items-center text-sm text-gray-900 dark:text-white dark:bg-[#424549]/80 border-black/20 dark:border-white/20">
            <span className="truncate">{selectedOption}</span>
            <ArrowIcon w="16" h="16" isOpen={open} />
          </div>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <ul className="w-40 bg-white dark:bg-[#424549] shadow-lg z-50 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
            {sortOptions.map((item, i) => (
              <li
                key={item.label}
                onClick={() => handleSelect(item.label, item.value)}
                className={`px-4 py-2 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-[#7289da]/70 ${
                  selectedOption === item.label ? "font-semibold" : ""
                } ${i === 0 ? "rounded-t-md" : ""} ${
                  i === sortOptions.length - 1 ? "rounded-b-md" : ""
                }`}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
}
