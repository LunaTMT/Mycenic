import React from "react";
import ReviewForm from "./Form/ReviewForm";
import SortByDropdown from "./Header/SortByDropdown";
import ReviewCard from "./Card/ReviewCard";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

export default function Reviews() {
  const {
    currentReviews,
    currentPage,
    setCurrentPage,
    totalPages,
    showForm,
    setShowForm,
  } = useReviews();

  return (
    <section className="space-y-2">
      <header className="flex items-center justify-between ">
        <div className="flex-1">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-3 py-1 bg-yellow-500 dark:bg-[#7289da] text-white rounded-md text-sm font-semibold hover:brightness-110 transition"
            aria-expanded={showForm}
            aria-controls="review-form"
          >
            {showForm ? "Close" : "Add Review"}
          </button>
        </div>

        <div className="ml-auto">
          <SortByDropdown />
        </div>
      </header>

      {showForm && (
        <section id="review-form">
          <ReviewForm />
        </section>
      )}

      {currentReviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {currentReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Reviews Pagination"
          className="flex justify-center gap-2 mt-6"
        >
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  isActive
                    ? "bg-yellow-500 dark:bg-[#7289da] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </nav>
      )}
    </section>
  );
}
