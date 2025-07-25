import React, { createContext, useContext, useState, useEffect } from "react";
import { resolveSrc } from "@/utils/resolveSrc";
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
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const useItemContext = (): ItemContextType => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("useItemContext must be used within an ItemProvider");
  }
  return context;
};

interface ItemProviderProps {
  item: Item;
  children: React.ReactNode;
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ item, children }) => {
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

  const [selectedImage, setSelectedImage] = useState<string>(
    resolveSrc(images[0] ?? "", imageSources[0] ?? "")
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [swiperRef, setSwiperRef] = useState<any | null>(null);

  useEffect(() => {
    const src = images[selectedIndex] ?? "";
    const source = imageSources[selectedIndex] ?? "";
    setSelectedImage(resolveSrc(src, source));
  }, [selectedIndex, images, imageSources]);

  return (
    <ItemContext.Provider
      value={{
        selectedIndex,
        setSelectedIndex,
        selectedOptions,
        setSelectedOptions,
        quantity,
        setQuantity,
        price: item.price.toString(),
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
