import React from "react";
import { ReviewsProvider, useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import ReviewCard from "@/Pages/Shop/Item/Feedback/Tabs/Reviews/Card/ReviewCard";
import { useUser } from "@/Contexts/UserContext";

const ReviewsList = () => {
  const { reviews, fetchReviews } = useReviews();

  if (reviews.length === 0) {
    return <p>No reviews found.</p>;
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
