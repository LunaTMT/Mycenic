import React from "react";
import ImageGallery from "./Left/ImageGallery";
import OptionsSelector from "./Right/OptionsSelector";
import AddToCartSection from "./Right/AddToCartSection";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import StaticStarRating from "@/Components/Stars/StaticStarRating";

const ItemTab: React.FC = () => {
  const { item } = useItemContext();
  const descriptionParagraphs = (item.description ?? "").split("\n\n");
  const reviewCount = item.reviews?.length ?? 0;

  return (
    <div className="h-[65vh] flex gap-6 text-gray-700 dark:text-gray-300 bg-transparent">
      {/* Left: Image Gallery */}
      <div className="w-1/2 h-full flex flex-col rounded-lg shadow-2xl overflow-hidden dark:bg-[#424549]">
        <ImageGallery />
      </div>

      {/* Right: Details & Cart */}
      <div className="w-1/2 h-full flex flex-col justify-between p-5 border rounded-lg shadow-2xl overflow-hidden bg-white dark:bg-[#424549] border-black/20 dark:border-white/20">
        {/* Description */}
        <div className="overflow-y-auto pr-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {item.name}
          </h2>

          <StaticStarRating rating={item.average_rating ?? 0} size={18} />

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
            {item.category}
          </p>

          {descriptionParagraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line mb-2">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Cart Section */}
        <div className="mt-6">
          <OptionsSelector />
          <AddToCartSection />
        </div>
      </div>
    </div>
  );
};

export default ItemTab;
