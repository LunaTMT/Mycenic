import React from "react";
import ReviewForm from "./Form/ReviewForm";
import SortByDropdown from "./Header/SortByDropdown";
import ReviewCard from "./Card/ReviewCard";
import { ReviewsProvider, useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

function ReviewsContent() {
  const {
    currentReviews,
    currentPage,
    setCurrentPage,
    totalPages,
    showForm,
    setShowForm,
  } = useReviews();

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="px-3 py-1 bg-yellow-500 dark:bg-[#7289da] text-white rounded-md text-sm font-semibold hover:brightness-110 transition"
      >
        {showForm ? "Close" : "Add Review"}
      </button>

      <div className="flex gap-2 items-center">
        <SortByDropdown />
      </div>
    </div>
  );

  const renderReviewList = () => {
    if (currentReviews.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>;
    }

    return (
      <div className="space-y-4">
        {currentReviews.map((review) => (
          <ReviewCard key={review.id || review.date} review={review} />
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
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
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-md">
        {renderHeader()}
        {showForm && <ReviewForm />}
        {renderReviewList()}
        {renderPagination()}
      </div>
    </div>
  );
}

export default function Reviews() {
  return (
    <ReviewsProvider>
      <ReviewsContent />
    </ReviewsProvider>
  );
}
