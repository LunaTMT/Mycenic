import React from "react";
import StaticStarRating from "../../../../../../../../../Components/Stars/StaticStarRating";
import { FaUserShield } from "react-icons/fa";
import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { usePage } from "@inertiajs/react";

interface Props {
  review: Review;
}

export default function ReviewHeader({ review }: Props) {
  const { auth } = usePage().props;
  const authUser = auth?.user;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
        {review.user?.name ?? "Unknown"}
        {review.isAdmin && (
          <FaUserShield className="text-yellow-500 dark:text-[#7289da]" title="Admin" />
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {new Date(review.created_at).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
        {!review.parent_id && review.rating && (
          <div className="ml-2">
            <StaticStarRating rating={review.rating} size={14} />
          </div>
        )}
      </div>
    </div>
  );
}
