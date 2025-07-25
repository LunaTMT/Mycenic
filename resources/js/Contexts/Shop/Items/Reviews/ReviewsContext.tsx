import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "react-toastify";
import { Review } from "@/types/types";

interface ReviewContextType {
  reviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  fetchReviews: () => void;
  toggleLike: (reviewId: number) => void;
  toggleDislike: (reviewId: number) => void;

  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  currentReviews: Review[];
  showForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  sortBy: string;
  handleSortChange: (value: string) => void;

  // Additional (optional) methods if needed
  addReply?: (reviewId: string, text: string) => void;
  expandedIds?: Set<string>;
  toggleExpandedId?: (id: string) => void;
  setOpenReplyFormId?: (id: string | null) => void;
  showReplyForm?: (id: string) => boolean;
}

const ReviewsContext = createContext<ReviewContextType | undefined>(undefined);

interface ReviewsProviderProps {
  initialReviews: Review[];
  children: React.ReactNode;
}

export const ReviewsProvider = ({ initialReviews, children }: ReviewsProviderProps) => {
  const { props } = usePage();
  const product = (props as any)?.product;

  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Additional state for expanded replies and reply forms
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openReplyFormId, setOpenReplyFormId] = useState<string | null>(null);

  const reviewsPerPage = 5;

  const fetchReviews = async () => {
    if (!product?.id) return;
    try {
      const response = await axios.get(`/products/${product.id}/reviews`);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  const updateReview = (id: number, updateFn: (review: Review) => Review) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === id ? updateFn(review) : review))
    );
  };

  const toggleLike = async (reviewId: number) => {
    try {
      const response = await axios.post(`/reviews/${reviewId}/like`);
      updateReview(reviewId, (review) => ({
        ...review,
        liked: response.data.liked,
        disliked: response.data.liked ? false : review.disliked,
        likes: response.data.likes,
        dislikes: response.data.dislikes,
      }));
    } catch {
      toast.error("Could not update like");
    }
  };

  const toggleDislike = async (reviewId: number) => {
    try {
      const response = await axios.post(`/reviews/${reviewId}/dislike`);
      updateReview(reviewId, (review) => ({
        ...review,
        disliked: response.data.disliked,
        liked: response.data.disliked ? false : review.liked,
        dislikes: response.data.dislikes,
        likes: response.data.likes,
      }));
    } catch {
      toast.error("Could not update dislike");
    }
  };

  // Add reply (simplified example)
  const addReply = (reviewId: string, text: string) => {
    // Implement your reply submission logic here
    // For example, POST to backend, then refresh or update state
    toast.info(`Reply submitted: ${text} to review ID ${reviewId}`);
    // Close reply form
    setOpenReplyFormId(null);
  };

  const toggleExpandedId = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const showReplyForm = (id: string) => openReplyFormId === id;

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  useEffect(() => {
    if (!product?.id) return;
    fetchReviews();
  }, [product?.id]);

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0)); // assuming id correlates to date
      case "oldest":
        return sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
      case "most_liked":
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "least_liked":
        return sorted.sort((a, b) => (a.likes || 0) - (b.likes || 0));
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  const totalPages = useMemo(
    () => Math.ceil(sortedReviews.length / reviewsPerPage),
    [sortedReviews.length]
  );

  const currentReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    return sortedReviews.slice(startIndex, startIndex + reviewsPerPage);
  }, [sortedReviews, currentPage]);

  const contextValue = useMemo(
    () => ({
      reviews,
      setReviews,
      fetchReviews,
      toggleLike,
      toggleDislike,

      currentPage,
      setCurrentPage,
      totalPages,
      currentReviews,
      showForm,
      setShowForm,
      sortBy,
      handleSortChange,

      // additional
      addReply,
      expandedIds,
      toggleExpandedId,
      setOpenReplyFormId,
      showReplyForm,
    }),
    [reviews, currentPage, showForm, sortBy, expandedIds, openReplyFormId]
  );

  return <ReviewsContext.Provider value={contextValue}>{children}</ReviewsContext.Provider>;
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error("useReviews must be used within a ReviewsProvider");
  return context;
};
