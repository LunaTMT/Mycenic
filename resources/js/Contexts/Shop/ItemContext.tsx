import React, { createContext, useContext, useState, useEffect } from "react";

interface Item {
  id: number;
  name: string;
  price: string;
  stock: number;
  category: string;
  images: string; // JSON stringified array of strings
  image_sources?: string; // JSON stringified array of strings, optional
  description: string;
  isPsyilocybinSpores: boolean;
  options?: string; // JSON stringified object
}

interface ItemContextType {
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedOptions: Record<string, string>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  stock: number;
  setStock: React.Dispatch<React.SetStateAction<number>>;
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
  getStock: (id: number) => Promise<number>;
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ item, children, getStock }) => {
  // Parse images and options
  const images: string[] = JSON.parse(item.images);
  const imageSources: string[] = item.image_sources ? JSON.parse(item.image_sources) : [];
  const options: Record<string, string[]> = item.options ? JSON.parse(item.options) : {};

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.entries(options).forEach(([key, values]) => {
      initial[key] = values[0];
    });
    return initial;
  });

  // Resolve image src helper that handles both Unsplash URLs and local paths
  const resolveSrc = (src: string, source?: string) => {
    if (source && (source.startsWith("http://") || source.startsWith("https://"))) {
      // Unsplash or other absolute URL
      return source;
    }
    if (src.startsWith("http://") || src.startsWith("https://")) {
      // Fallback absolute URL
      return src;
    }
    // Local file path
    return `/${src}`;
  };

  const [selectedImage, setSelectedImage] = useState<string>(
    resolveSrc(
      images[0],
      imageSources[0]
    )
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [stock, setStock] = useState<number>(item.stock);

  // Store swiper instance here for controlling slides
  const [swiperRef, setSwiperRef] = useState<any | null>(null);

  // Update selected image on selectedIndex change
  useEffect(() => {
    const src = images[selectedIndex];
    const source = imageSources[selectedIndex];
    setSelectedImage(resolveSrc(src, source));
  }, [selectedIndex, images, imageSources]);

  // Fetch updated stock on mount or item change
  useEffect(() => {
    const fetchStock = async () => {
      const updatedStock = await getStock(item.id);
      setStock(updatedStock);
      if (updatedStock === 0) setQuantity(1);
      else if (quantity > updatedStock) setQuantity(updatedStock);
    };
    fetchStock();
  }, [item.id, getStock, quantity]);

  return (
    <ItemContext.Provider
      value={{
        selectedIndex,
        setSelectedIndex,
        selectedOptions,
        setSelectedOptions,
        quantity,
        setQuantity,
        stock,
        setStock,
        price: item.price,
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
