import React from "react";

interface StarRatingProps {
  rating: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
}

export default function StarRating({ rating, setRating }: StarRatingProps) {
  return (
    <div className="flex items-center space-x-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`text-4xl transition-colors duration-200 ${
            star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
          } hover:text-yellow-500 focus:outline-none`}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
