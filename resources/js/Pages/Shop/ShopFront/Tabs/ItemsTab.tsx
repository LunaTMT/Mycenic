import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useShop } from "@/Contexts/Shop/ShopContext";
import ItemCard from "@/Pages/Shop/ShopFront/ItemCard";

import SubNavigation from "@/Components/Tabs/SubTab/SubNavigation";
import FilterButton from "@/Components/Buttons/FilterButton";
import SortDropdown from "@/Components/Dropdown/SortDropdown";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const ITEMS_PER_PAGE = 10;

const ItemsTab: React.FC = () => {
  const { items } = useShop();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <SubNavigation
        rightContent={
          <div className="flex justify-end space-x-4">
            <FilterButton />
            <SortDropdown />
          </div>
        }
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`items-grid-page-${currentPage}`}
          className="grid grid-cols-5 grid-rows-2 gap-4 p-4 rounded-lg"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ minHeight: "600px" }} // enough height for 2 rows
        >
          {paginatedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <nav
          aria-label="Items Pagination"
          className="flex justify-center gap-2"
        >
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-yellow-500 dark:bg-[#7289da] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default ItemsTab;
