import React from "react";
import InputLabel from "@/Components/Login/InputLabel";
import StarRating from "./StarRating";
import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

type ReviewInputAreaProps = {
  review: Review;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  rating: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
};

export default function ReviewInputArea({
  review,
  content,
  setContent,
  rating,
  setRating,
}: ReviewInputAreaProps) {
  const { MAX_LENGTH, errors } = useReviews();

  const error = errors.review;

  return (
    <div>
      <InputLabel htmlFor="review" value="Your Review" />

      <div className="relative mt-1 w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
        <textarea
          id="review"
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= MAX_LENGTH) {
              console.log("[ReviewInputArea] Updated content:", e.target.value);
              setContent(e.target.value);
            }
          }}
          placeholder="Write your review here..."
          rows={5}
          className="
            resize-none w-full
            bg-white dark:bg-[#1e2124]
            text-gray-900 dark:text-gray-100
            px-4 pt-3 pb-12
            rounded-md
            border-none
            focus:outline-none focus:ring-0
            min-h-[120px]
          "
        />

        <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
            {content.length} / {MAX_LENGTH}
          </div>

          <StarRating
            rating={rating}
            setRating={(value) => {
              console.log("[ReviewInputArea] Updated rating:", value);
              setRating(value);
            }}
          />
        </div>
      </div>

      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
