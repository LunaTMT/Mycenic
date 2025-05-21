import React, { createContext, useState, useContext, useEffect } from "react";

interface Item {
  id: number;
  name: string;
  price: number;
  images: string[];
  weight: number;
  stock: number;
  category: string; // Assuming each item has a category
}

interface ShopContextProps {
  filterVisible: boolean;
  setFilterVisible: (visible: boolean) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  filteredItems: Item[];
  setFilteredItems: (items: Item[]) => void;
  applySorting: (items: Item[]) => Item[];
  category: string;
  setCategory: (category: string) => void;
}

const ShopContext = createContext<ShopContextProps | undefined>(undefined);

export const ShopProvider: React.FC<{ items: Item[]; children: React.ReactNode }> = ({ items, children }) => {
  const [filterVisible, setFilterVisible] = useState(() => {
    const stored = localStorage.getItem("filterVisible");
    return stored ? JSON.parse(stored) : false;
  });

  const [filteredItems, setFilteredItems] = useState<Item[]>(items);
  const [sortOption, setSortOption] = useState("Newest");
  const [category, setCategory] = useState("All");

  const applySorting = (items: Item[]): Item[] => {
    const sorted = Array.isArray(items) ? [...items] : [];
    
    if (sortOption === "LOW - HIGH") {
      return sorted.sort((a, b) => a.price - b.price);
    }
    if (sortOption === "HIGH - LOW") {
      return sorted.sort((a, b) => b.price - a.price);
    }
    
    return sorted;
  };

  const applyCategoryFilter = (items: Item[], category: string): Item[] => {
    if (category === "All") {
      return items;
    }
    return items.filter(item => item.category === category);
  };

  // Filter items based on category and apply sorting
  useEffect(() => {
    let filteredByCategory = applyCategoryFilter(items, category);
    filteredByCategory = applySorting(filteredByCategory);
    setFilteredItems(filteredByCategory);
  }, [category, sortOption, items]); // Update when category or sort option changes

  useEffect(() => {
    localStorage.setItem("filterVisible", JSON.stringify(filterVisible));
  }, [filterVisible]);

  return (
    <ShopContext.Provider
      value={{
        filterVisible,
        setFilterVisible,
        sortOption,
        setSortOption,
        filteredItems,
        setFilteredItems,
        applySorting,
        category,
        setCategory,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
