import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import ReviewForm from "./ReviewForm";
import { placeholderReviews } from "./ReviewsData";
import SortByDropdown from "./SortByDropdown";
import ReviewCard from "./ReviewCard";
import { Review } from "@/Contexts/Shop/Items/ReviewsContext";

interface PageProps {
  auth: {
    user: any;
  };
  errors: any;
}

export default function Reviews() {
  // Properly cast the page props
  const { auth } = usePage<PageProps>().props; 
  const authUser = auth?.user ?? null;

  const [localReviews, setLocalReviews] = useState<Review[]>(placeholderReviews);
  const [rating, setRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const reviewsPerPage = 5;  // <-- Set to 3 here

  const getLikes = (review: Review) => {
    return typeof review.likes === "number" ? review.likes : 0;
  };

  const sortedReviews = [...localReviews]
    .filter((review) => review.verified)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "most_liked") return getLikes(b) - getLikes(a);
      if (sortBy === "least_liked") return getLikes(a) - getLikes(b);
      return 0;
    });

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
        <ReviewForm
          rating={rating}
          setRating={setRating}
          setReviews={setLocalReviews}
          resetRating={() => setRating(0)}
          authUser={authUser}
        />

        <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-[#2c2f33]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Customer Reviews</h2>
            <SortByDropdown sortBy={sortBy} onSortChange={handleSortChange} />
          </div>

          <div className="rounded-lg space-y-2">
            {currentReviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
            ) : (
              currentReviews.map((review, index) => (
                <ReviewCard key={index} review={review} />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === i + 1
                      ? "bg-yellow-500 dark:bg-[#7289da]  text-white"
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
