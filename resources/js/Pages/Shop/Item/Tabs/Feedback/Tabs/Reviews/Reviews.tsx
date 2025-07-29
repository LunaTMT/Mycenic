import React from "react";
import ReviewForm from "./Form/ReviewForm";
import SortByDropdown from "./Header/SortByDropdown";
import ReviewCard from "./Card/ReviewCard";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

export default function Reviews() {
  const { showForm, setShowForm, reviews } = useReviews();

  console.log(reviews);
  if (!reviews) {
    return <p>No reviews</p>;
  }

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

      {reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter((review) => review && review.id !== undefined && review.parent_id === null)
            .map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
        </div>
      )}

      {/* Pagination commented out for now */}
    </section>
  );
}
