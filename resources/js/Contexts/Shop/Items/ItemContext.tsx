import React, { createContext, useContext, useState } from "react";
import { Item } from "@/types/types";

interface ItemContextType {
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedOptions: Record<string, string>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  price: string;
  item: Item;
  selectedImage: string;
  setSelectedImage: React.Dispatch<React.SetStateAction<string>>;
  images: string[];
  imageSources: string[];
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
  const images: string[] = Array.isArray(item.images) ? item.images : [];
  const imageSources: string[] = Array.isArray(item.image_sources) ? item.image_sources : [];

  while (imageSources.length < images.length) {
    imageSources.push("");
  }

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
  const [price] = useState(item.price);
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
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
        price,
        item,
        selectedImage,
        setSelectedImage,
        images,
        imageSources,
        options,
        swiperRef,
        setSwiperRef,

      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export const useItemContext = (): ItemContextType => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("useItem must be used within an ItemProvider");
  }
  return context;
};
