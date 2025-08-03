import React from "react";
import ReviewForm from "./Form/ReviewForm";
import SortByDropdown from "./Header/SortByDropdown";
import ReviewCard from "./Card/ReviewCard";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";


export default function Reviews() {
  const {
    showForm,
    setShowForm,
    currentReviews,
    sortBy,
    handleSortChange,
    currentPage,
    setCurrentPage,
    totalPages,
    reviews,
  } = useReviews();

  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>;
  }

  console.log(currentReviews);
  return (
    <section className="space-y-2 ">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex-grow">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-3 py-1 bg-yellow-500 dark:bg-[#7289da] text-white rounded-md text-sm font-semibold hover:brightness-110 transition"
            aria-expanded={showForm}
            aria-controls="review-form"
          >
            {showForm ? "Close" : "Add Review"}
          </button>
        </div>
        <div className="flex-shrink-0">
          <SortByDropdown />
        </div>
      </header>


      {showForm && (
        <section id="review-form">
          <ReviewForm />
        </section>
      )}

      <div className="space-y-4">
        {currentReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">


          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === i + 1
                  ? "bg-yellow-500 text-white dark:bg-[#7289da]"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}

          
        </div>
      )}
    </section>
  );
}
