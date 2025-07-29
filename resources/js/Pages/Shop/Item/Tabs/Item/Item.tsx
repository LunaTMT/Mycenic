import React from "react";
import ImageGallery from "./Left/ImageGallery";
import OptionsSelector from "./Right/OptionsSelector";
import AddToCartSection from "./Right/AddToCartSection";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import StaticStarRating from "@/Components/Stars/StaticStarRating";

const Item: React.FC = () => {
  const { item } = useItemContext();

  const descriptionParagraphs = (item.description ?? "").split("\n\n");
  const reviewCount = item.reviews?.length ?? 0;

  return (
    <div className="h-[75vh] flex gap-6 text-gray-700 dark:text-gray-300">
      {/* Left: Image Gallery */}
      <div className="w-1/2 h-full flex flex-col overflow-hidden">
        <ImageGallery />
      </div>

      {/* Right: Details & Cart */}
      <div className="w-1/2 h-full flex flex-col justify-between p-5 border rounded-lg bg-white dark:bg-[#1e2124]/30 border-black/20 dark:border-white/20 overflow-hidden">
        {/* Top: Description */}
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

          {descriptionParagraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line mb-2">
              {p}
            </p>
          ))}
        </div>

        {/* Bottom: Cart Controls */}
        <div className="mt-6">
          <OptionsSelector />
          <AddToCartSection />
        </div>
      </div>
    </div>
  );
};

export default Item;
