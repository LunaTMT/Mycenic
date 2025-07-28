import React from "react";
import StaticStarRating from "@/Components/Stars/StaticStarRating";
import { FaUserShield } from "react-icons/fa";
import { usePage } from "@inertiajs/react";
import ArrowButton from "@/Components/Icon/ArrowIcon";
import { User, Review } from "@/types";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface PageProps {
  auth: {
    user: User | null;
  };
}

interface Props {
  review: Review;
}

export default function ReviewHeader({ review }: Props) {

  // Get expandedIds and toggleExpandedId from context
  const { expandedIds, toggleExpandedId } = useReviews();

  const reviewId = review.id?.toString() ?? "";
  const isExpanded = expandedIds.has(reviewId);

  if (!review) return <div>Loading...</div>;

  return (
    <div className="relative flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
          {review.user.name}
          {review.isAdmin && (
            <FaUserShield
              className="text-yellow-500 dark:text-[#7289da]"
              title="Admin"
            />
          )}
        </div>

        {/* Use context toggleExpandedId directly here */}
        <ArrowButton
          isOpen={isExpanded}
          onClick={() => toggleExpandedId(reviewId)}
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

        <div className="ml-2">
          <StaticStarRating rating={Number(review.rating)} size={14} />
        </div>

      </div>
    </div>
  );
}
