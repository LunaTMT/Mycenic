import React, { createContext, useContext, useState } from "react";
import { Item } from "@/types/Item";

interface ItemContextType {
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedOptions: Record<string, string>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  item: Item;
  options: Record<string, string[]>;
  swiperRef: any | null;
  setSwiperRef: React.Dispatch<React.SetStateAction<any | null>>;
  filteredReviews: Item["reviews"];
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ item: Item; children: React.ReactNode }> = ({
  item,
  children,
}) => {
  const options: Record<string, string[]> = item.options ?? {};

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.entries(options).forEach(([key, values]) => {
      initial[key] = Array.isArray(values) && values.length > 0 ? values[0] : "";
    });
    return initial;
  });

  const [quantity, setQuantity] = useState(1);

  const [swiperRef, setSwiperRef] = useState<any | null>(null);

  return (
    <ItemContext.Provider
      value={{
        selectedIndex,
        setSelectedIndex,
        selectedOptions,
        setSelectedOptions,
        quantity,
        setQuantity,
        item,
        options,
        swiperRef,
        setSwiperRef,
        filteredReviews: item.reviews,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export const useItemContext = (): ItemContextType => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("useItemContext must be used within an ItemProvider");
  }
  return context;
};
