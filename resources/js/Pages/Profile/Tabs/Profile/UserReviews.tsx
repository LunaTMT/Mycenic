import React, { useEffect, useState } from "react";
import axios from "axios";

import { Review } from "@/types/Review";
import { toast } from "react-toastify";
import { ReviewsProvider } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import ReviewCard from "@/Pages/Shop/Item/Tabs/Feedback/Tabs/Reviews/Card/ReviewCard";
import { useUser } from "@/Contexts/UserContext";

const UserReviews = () => {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    if (!user) {
      console.log("No user available, skipping fetch.");
      setLoading(false);
      setReviews([]);
      return;
    }

    setLoading(true);
    console.log("Fetching reviews for user ID:", user.id);

    try {
      const url = `/reviews?user_id=${user.id}`;

      const res = await axios.get<Review[]>(url);
      console.log(res.data);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user?.id]);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div>
      {reviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <ReviewsProvider initialReviews={reviews}>
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </ReviewsProvider>
      )}
    </div>
  );
};

export default UserReviews;
