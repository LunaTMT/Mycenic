import React from "react";
import { ReviewsProvider, useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import ReviewCard from "@/Pages/Shop/Item/Feedback/Tabs/Reviews/Card/ReviewCard";
import { useUser } from "@/Contexts/UserContext";
import { MdOutlineReviews } from "react-icons/md";

const ReviewsList = () => {
  const { reviews } = useReviews();

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div
          className={`
            flex items-center justify-center
            w-20 h-20 rounded-xl
            text-yellow-500 dark:text-[#7289da]

          `}
        >
          <MdOutlineReviews size={50} />
        </div>

        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          No reviews submitted.
        </p>

      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

const UserReviews = () => {
  const { user } = useUser();

  return (
    <ReviewsProvider userId={user.id}>
      <ReviewsList />
    </ReviewsProvider>
  );
};

export default UserReviews;
