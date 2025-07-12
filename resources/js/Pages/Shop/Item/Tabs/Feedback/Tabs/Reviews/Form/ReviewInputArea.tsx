import React from "react";
import InputLabel from "@/Components/Login/InputLabel";
import StarRating from "../test/StarRating";

interface ReviewInputAreaProps {
  review: string;
  onReviewChange: (value: string) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  maxLength: number;
  error?: string;
}

export default function ReviewInputArea({
  review,
  onReviewChange,
  rating,
  onRatingChange,
  maxLength,
  error,
}: ReviewInputAreaProps) {
  return (
    <div>
      <InputLabel htmlFor="review" value="Your Review" />

      <div className="relative mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
        <textarea
          id="review"
          value={review}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onReviewChange(e.target.value);
            }
          }}
          placeholder="Write your review here..."
          className="
            resize-none w-full
            bg-transparent text-sm
            text-gray-900 dark:text-gray-100
            px-4 pt-3 pb-12
            rounded-md
            border-none
            focus:outline-none focus:ring-0
            min-h-[120px]
          "
          rows={5}
        />

        <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
            {review.length} / {maxLength}
          </div>

          <StarRating rating={rating} setRating={onRatingChange} />
        </div>
      </div>

      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
