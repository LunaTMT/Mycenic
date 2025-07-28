import React from "react";
import Avatar from "./Content/Avatar";
import ReviewHeader from "./Content/ReviewHeader";
import ReviewBody from "./Content/ReviewBody";
import ActionButtons from "./Content/ActionButtons";
import { Review } from "@/types/types";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";


interface ReviewCardProps {
  review: Review;
  depth?: number;
}

export default function ReviewCard({ review, depth = 0 }: ReviewCardProps) {
  const { expandedIds } = useReviews();

  const reviewId = review.id?.toString() ?? "";
  const isExpanded = expandedIds.has(reviewId);

  return (
    <div
      className={`relative p-4 space-y-4 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60`}
      style={{ marginLeft: depth * 12 }}
    >
      <div className="flex space-x-4">
        <Avatar review={review} />
        <div className="flex-1 break-words">
          <div className="min-h-[100px] flex flex-col justify-between space-y-3">
            <ReviewHeader review={review} />
            <ReviewBody review={review} />
            <ActionButtons review={review} />
          </div>
        </div>
      </div>

      {/* Recursively render replies */}
      {isExpanded && review.replies && review.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {review.replies.map((r) => (
            <ReviewCard key={r.id} review={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
