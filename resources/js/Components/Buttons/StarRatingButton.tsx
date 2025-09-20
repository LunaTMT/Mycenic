import React, { useState } from "react";

interface StarRatingProps {
  rating: number; // current rating 0 - 5 in 0.5 steps
  onChange: (rating: number) => void;
  size?: number;
}

export default function StarRating({ rating, onChange, size = 30 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const getStarIcon = (starIndex: number) => {
    const currentRating = hoverRating !== null ? hoverRating : rating;
    if (currentRating >= starIndex + 1) {
      return "★"; // full star
    } else if (currentRating >= starIndex + 0.5) {
      return "⯨"; // half star (using unicode character, can substitute with an SVG or icon if you want)
    } else {
      return "☆"; // empty star
    }
  };

  // For accessibility: starIndex goes from 0 to 4 for full stars, but here we treat half increments, so 10 clickable buttons
  // We'll render 10 buttons for 0.5 increments: 0.5, 1, 1.5, 2 ... 5 stars

  return (
    <div className="flex gap-1 select-none" role="radiogroup" aria-label="Star rating">
      {[...Array(10)].map((_, i) => {
        const starValue = (i + 1) * 0.5;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(null)}
            aria-checked={rating === starValue}
            role="radio"
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            style={{ fontSize: size }}
            className={`leading-none cursor-pointer ${
              starValue <= (hoverRating ?? rating) ? "text-yellow-400" : "text-gray-400 dark:text-gray-600"
            }`}
          >
            {getStarIcon(Math.floor(i / 2))}
          </button>
        );
      })}
    </div>
  );
}
