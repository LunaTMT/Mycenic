import React from "react";
import { Review } from "../../types";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="p-4 border border-black/20 dark:border-white/20 rounded-md bg-white dark:bg-[#1e2124]">
      <div className="flex items-center mb-3">
        <img
          src={review.profileImage}
          alt={`${review.author}'s profile`}
          className="w-9 h-9 rounded-full mr-4 border border-gray-300 dark:border-gray-600"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-3 text-sm font-semibold text-gray-900 dark:text-white">
            {review.author}
            {review.verified && (
              <span className="px-2 py-0.5 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-full whitespace-nowrap">
                Verified Purchase
              </span>
            )}
          </div>
          <div className="text-yellow-500 text-sm select-none">
            {"★".repeat(review.rating)}
            <span className="text-gray-400 dark:text-gray-500">{"★".repeat(5 - review.rating)}</span>
          </div>
        </div>
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{review.date}</span>
      </div>
      <p className="text-gray-800 dark:text-gray-100 text-sm">{review.comment}</p>
    </div>
  );
}
