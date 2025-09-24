import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { Item } from "@/types/Item";

interface ShopContextProps {
  sortOption: string;
  setSortOption: (option: string) => void;
  items: Item[];
  setItems: (items: Item[]) => void;
  applySorting: (items: Item[]) => Item[];
  category: string;
  setCategory: (category: string) => void;
  availableCategories: string[];  // <-- add here
}

const ShopContext = createContext<ShopContextProps | undefined>(undefined);

export const ShopProvider: React.FC<{ items: Item[]; children: React.ReactNode }> = ({
  items: initialItems,
  children,
}) => {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [sortOption, setSortOption] = useState("Newest");
  const [category, setCategory] = useState("All");

  // Compute available categories dynamically from initialItems, memoized
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    initialItems.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return ["All", ...Array.from(cats).sort()];
  }, [initialItems]);

  const applySorting = (items: Item[]): Item[] => {
    const sorted = Array.isArray(items) ? [...items] : [];

    switch (sortOption) {
      case "LOW - HIGH":
        return sorted.sort((a, b) => a.price - b.price);

      case "HIGH - LOW":
        return sorted.sort((a, b) => b.price - a.price);

      case "MOST POPULAR":
        return sorted.sort((a, b) => {
          const ratingA = a.average_rating ?? 0;
          const ratingB = b.average_rating ?? 0;
          const reviewsA = a.reviews?.length ?? 0;
          const reviewsB = b.reviews?.length ?? 0;

          // Weighted score: 70% rating + 30% number of reviews
          const scoreA = ratingA * 0.7 + reviewsA * 0.3;
          const scoreB = ratingB * 0.7 + reviewsB * 0.3;

          return scoreB - scoreA;
        });

      case "LEAST POPULAR":
        return sorted.sort((a, b) => {
          const ratingA = a.average_rating ?? 0;
          const ratingB = b.average_rating ?? 0;
          const reviewsA = a.reviews?.length ?? 0;
          const reviewsB = b.reviews?.length ?? 0;

          const scoreA = ratingA * 0.7 + reviewsA * 0.3;
          const scoreB = ratingB * 0.7 + reviewsB * 0.3;

          return scoreA - scoreB;
        });

      case "MOST REVIEWS":
        return sorted.sort((a, b) => (b.reviews?.length ?? 0) - (a.reviews?.length ?? 0));

      case "LEAST REVIEWS":
        return sorted.sort((a, b) => (a.reviews?.length ?? 0) - (b.reviews?.length ?? 0));

      case "NEWEST":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Newest first
        });

      case "OLDEST":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateA - dateB; // Oldest first
        });

      default:
        return sorted;
    }
  };


  const applyCategoryFilter = (items: Item[], category: string): Item[] => {
    if (category === "All") {
      return items;
    }
    return items.filter(item => item.category === category);
  };

  useEffect(() => {
    let filtered = applyCategoryFilter(initialItems, category);
    filtered = applySorting(filtered);
    setItems(filtered);
  }, [initialItems, category, sortOption]);

  return (
    <ShopContext.Provider
      value={{
        sortOption,
        setSortOption,
        items,
        setItems,
        applySorting,
        category,
        setCategory,
        availableCategories,   // <-- expose here
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextProps => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
