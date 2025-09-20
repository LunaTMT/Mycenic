import React from "react";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import InputLabel from "@/Components/Login/InputLabel";
import StarRating from "./StarRating";
import { Review } from "@/types/Review";

const MAX_LENGTH = 300;

interface ReviewContentProps {
  review: Review;
}

export default function ReviewContent({ review }: ReviewContentProps) {
  const { reviewEditStates, updateReviewState } = useReviews();

  const editState = reviewEditStates[review.id];
  const isEditing = editState?.isEditing ?? false;
  const isTopLevel = review.parent_id == null;

  if (isEditing && editState) {
    return (
      <>
        <InputLabel
          htmlFor={`review-${review.id}`}
          value={isTopLevel ? "Your Review" : "Your Reply"}
        />
        <div className="relative text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
          <textarea
            id={`review-${review.id}`}
            value={editState.content}
            onChange={(e) =>
              updateReviewState(review.id, { content: e.target.value })
            }
            placeholder="Write your review here..."
            rows={5}
            maxLength={MAX_LENGTH}
            className="resize-none w-full bg-white dark:bg-[#1e2124] text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
          />
          <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
              {editState.content?.length ?? 0} / {MAX_LENGTH}
            </div>

            {isTopLevel && (
              <StarRating
                rating={editState.rating}
                setRating={(r) =>
                  updateReviewState(review.id, { rating: r })
                }
              />
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 break-words space-y-2">
      <div>{review.content}</div>
    </div>
  );
}
