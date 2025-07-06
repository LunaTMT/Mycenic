import React from "react";
import ImageGallery from "./Left/ImageGallery";
import OptionsSelector from "./Right/OptionsSelector";
import AddToCartSection from "./Right/AddToCartSection";

interface ItemProps {
  item: {
    name: string;
    category: string;
    description: string;
  };
}

const Item: React.FC<ItemProps> = ({ item }) => {
  const descriptionParagraphs = item.description.split("\n\n");

  return (
    <div className="h-[75vh] flex text-gray-700 dark:text-gray-300 gap-6">
      {/* Left */}
      <div className="w-1/2 h-full flex flex-col overflow-hidden">
        <ImageGallery />
      </div>

      {/* Right */}
      <div className="w-1/2 h-full flex flex-col justify-between p-5 border rounded-lg bg-white dark:bg-[#1e2124]/30 border-black/20 dark:border-white/20 overflow-hidden">
        {/* Top description content */}
        <div className="overflow-y-auto pr-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {item.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
            {item.category}
          </p>

          {descriptionParagraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line mb-2">
              {p}
            </p>
          ))}
        </div>

        {/* Bottom cart controls */}
        <div className="mt-6">
          <OptionsSelector />
          <AddToCartSection />
        </div>
      </div>
    </div>
  );
};

export default Item;
