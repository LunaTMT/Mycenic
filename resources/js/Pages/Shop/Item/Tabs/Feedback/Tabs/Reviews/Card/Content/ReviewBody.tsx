import React from "react";
import InputLabel from "@/Components/Login/InputLabel";
import StarRating from "../../Form/StarRating";
import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface ReviewBodyProps {
  isEditing: boolean;
  localContent: string;
  setLocalContent: (value: string) => void;
  saveContent: () => Promise<void>;
  localRating: number;
  setLocalRating: (value: number) => void;
  errors: { review?: string };
  MAX_LENGTH: number;
  reviewContent?: string;
  review: Review;
}

const ReviewBody: React.FC<ReviewBodyProps> = ({
  isEditing,
  localContent,
  setLocalContent,
  saveContent,
  localRating,
  setLocalRating,
  errors,
  MAX_LENGTH,
  reviewContent,
  review,
}) => {
  return (
    <div className="space-y-2">
      {isEditing ? (
        <>
          <InputLabel
            htmlFor="review"
            value={review.parent_id === null ? "Your Review" : "Your Reply"}
          />
          <div className="relative text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
            <textarea
              id="review"
              value={localContent}
              onChange={(e) => {
                console.log("Typing:", e.target.value);
                setLocalContent(e.target.value);
              }}
              onBlur={saveContent}
              placeholder="Write your review here..."
              rows={5}
              className="resize-none w-full bg-white dark:bg-[#1e2124] text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
            />
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                {localContent.length} / {MAX_LENGTH}
              </div>
              {review.parent_id === null && (
                <StarRating rating={localRating} setRating={setLocalRating} />
              )}
            </div>
          </div>
          {errors.review && <span className="text-red-500">{errors.review}</span>}
        </>
      ) : (
        <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 break-words">
          {reviewContent}
        </div>
      )}
    </div>
  );
};

export default ReviewBody;
