import React from "react";
import { Review } from "@/types/Review";
import { FaUserShield } from "react-icons/fa";
import StaticStarRating from "@/Components/Stars/StaticStarRating";
import ArrowIcon from "@/Components/Icon/ArrowIcon";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext"; // Adjust path if needed

interface Props {
  review: Review;
}

export default function ReviewHeader({ review }: Props) {
  const { isExpanded, toggleExpandedId } = useReviews(); // ✅ use toggleExpandedId instead

  const expanded = isExpanded(review.id);
  const user = review.user;

  return (
    <div className="relative flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
          {user.name}
        </div>
        <ArrowIcon
          isOpen={expanded}
          onClick={() => toggleExpandedId(review.id)} // ✅ changed
          w="24"
          h="24"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {review.created_at ? (
          new Date(review.created_at).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        ) : (
          "Unknown date"
        )}
        {review.parent_id === null && (
          <div className="ml-2">
            <StaticStarRating rating={Number(review.rating)} size={14} />
          </div>
        )}
      </div>
    </div>
  );
}
