import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useShop } from "@/Contexts/Shop/ShopContext";
import ItemCard from "@/Pages/Shop/ShopFront/ItemCard";
import FilterButton from "@/Components/Buttons/FilterButton";
import SortDropdown from "@/Components/Dropdown/SortDropdown";

const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const ITEMS_PER_PAGE = 10;

const ItemsSection: React.FC = () => {
  const { items, category } = useShop();
  const [currentPage, setCurrentPage] = useState(1);
  console.log(items);
  
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when category changes
  }, [category]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section className="p-4">
      <header className="flex items-center justify-end">
        <div className="flex space-x-4">
          <FilterButton />
          <SortDropdown />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${category}-${currentPage}`}
          className="grid grid-cols-5 grid-rows-2 gap-4 rounded-lg"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ minHeight: "600px" }}
        >
          {paginatedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <nav aria-label="Items Pagination" className="flex justify-center gap-2 mt-6">
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
    </section>
  );
};

export default ItemsSection;
