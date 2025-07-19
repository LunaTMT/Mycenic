import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export interface Review {
  id?: number;
  user: {
    id: number;
    name: string;
    avatar: string | null;
    email: string;
  };
  content: string;
  created_at: string;
  replies_recursive: Review[];
  images?: { id: number; image_path: string }[];
  isAdmin?: boolean;
  likes?: number;
  dislikes?: number;
  parent_id?: number | null;
  rating?: number;
  itemId: number;
}

interface ReviewsDataContextType {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  sortBy: "newest" | "oldest";
  setSortBy: (value: "newest" | "oldest") => void;
  handleSortChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  reviewsPerPage: number;
  totalPages: number;
  currentReviews: Review[];
  refreshReviews: () => Promise<void>;
}

const ReviewsDataContext = createContext<ReviewsDataContextType | undefined>(undefined);

export const ReviewsDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortByState] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const refreshReviews = async () => {
    try {
      console.log("[refreshReviews] Fetching reviews...");
      const response = await axios.get<Review[]>("/reviews");
      console.log("[refreshReviews] Fetched", response.data.length, "reviews");
      setReviews(response.data);
    } catch (err) {
      console.error("[refreshReviews] Failed to fetch reviews", err);
      toast.error("Failed to load reviews.");
    }
  };

  useEffect(() => {
    console.log("[useEffect] Initial fetch");
    refreshReviews();
  }, []);

  const sortedReviews = useMemo(() => {
    console.log("[useMemo] Sorting reviews by", sortBy);
    return [...reviews].sort((a, b) =>
      sortBy === "newest"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [reviews, sortBy]);

  const topLevelReviews = useMemo(() => {
    const top = sortedReviews.filter((review) => review.parent_id == null);
    console.log("[useMemo] Top-level reviews count:", top.length);
    return top;
  }, [sortedReviews]);

  const totalPages = Math.ceil(topLevelReviews.length / reviewsPerPage);

  const currentReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    const end = start + reviewsPerPage;
    const pageReviews = topLevelReviews.slice(start, end);
    console.log(`[useMemo] Page ${currentPage} reviews:`, pageReviews.length);
    return pageReviews;
  }, [topLevelReviews, currentPage]);

  const setSortBy = (value: "newest" | "oldest") => {
    console.log("[setSortBy] Changing sort to", value);
    setSortByState(value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as "newest" | "oldest";
    setSortBy(value);
  };

  // Memoize context value to avoid unnecessary rerenders
  const contextValue = useMemo(() => ({
    reviews,
    setReviews,
    sortBy,
    setSortBy,
    handleSortChange,
    currentPage,
    setCurrentPage,
    reviewsPerPage,
    totalPages,
    currentReviews,
    refreshReviews,
  }), [
    reviews,
    sortBy,
    currentPage,
    totalPages,
    currentReviews,
  ]);

  return (
    <ReviewsDataContext.Provider value={contextValue}>
      {children}
    </ReviewsDataContext.Provider>
  );
};

export const useReviewsData = () => {
  const context = useContext(ReviewsDataContext);
  if (!context) throw new Error("useReviewsData must be used within ReviewsDataProvider");
  return context;
};
