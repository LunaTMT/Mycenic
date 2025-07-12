import React, { useState } from "react";
import ReviewForm from "./Form/ReviewForm";
import SortByDropdown from "./SortByDropdown";

import ReviewCard from "./ReviewCard";
import { ReviewsProvider, useReviews } from "@/Contexts/Shop/Items/ReviewsContext";

function ReviewsContent() {
  const { currentReviews, currentPage, setCurrentPage, totalPages, showForm, setShowForm } = useReviews();

  console.log("current_reviews : ", currentReviews);
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-md">
        <div className="flex justify-between items-center mb-4">
          {/* Add Review button on the left */}
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-3 py-1 bg-yellow-500 dark:bg-[#7289da] text-white rounded-md text-sm font-semibold hover:brightness-110 transition"
          >
            {showForm ? "Close" : "Add Review"}
          </button>

          {/* Sort dropdowns on the right */}
          <div className="flex gap-2 items-center">

            <SortByDropdown />
          </div>
        </div>

        {showForm && <ReviewForm />}

        {currentReviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {currentReviews.map((review) => (
              <ReviewCard key={review.id || review.date} review={review} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === i + 1
                    ? "bg-yellow-500 dark:bg-[#7289da] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function   Reviews() {
  return (
    <ReviewsProvider>
      <ReviewsContent />
    </ReviewsProvider>
  );
}
