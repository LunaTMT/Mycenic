import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import { Review } from "../../Feedback";

const placeholderReviews: Review[] = [
  {
    author: "Emily Carter",
    profileImage: "https://i.pravatar.cc/150?img=44",
    rating: 5,
    comment: "Absolutely love this product! Arrived quickly and works perfectly.",
    date: "2024-06-21",
    verified: true,
  },
  {
    author: "Jake Nguyen",
    profileImage: "https://i.pravatar.cc/150?img=32",
    rating: 4,
    comment: "Really good quality. Lost one star because the packaging could be better.",
    date: "2024-06-10",
    verified: true,
  },
  {
    author: "Sophia Martinez",
    profileImage: "https://i.pravatar.cc/150?img=65",
    rating: 3,
    comment: "It’s okay — not quite what I expected, but decent for the price.",
    date: "2024-05-30",
    verified: false,
  },
];

export default function Reviews() {
  const { auth } = usePage().props as { auth: { user: any } };
  const authUser = auth?.user ?? null;

  const [localReviews, setLocalReviews] = useState<Review[]>(placeholderReviews);
  const [rating, setRating] = useState<number>(0);

  return (
    <div className="space-y-6">
      <ReviewForm
        rating={rating}
        setRating={setRating}
        setReviews={setLocalReviews}
        resetRating={() => setRating(0)}
        authUser={authUser}
      />
      <div className="border border-black/20 dark:border-white/20 rounded-lg p-6 bg-white dark:bg-[#1e2124]/30 space-y-6">
        {localReviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
        ) : (
          localReviews.map((review, index) => <ReviewCard key={index} review={review} />)
        )}
      </div>
    </div>
  );
}
