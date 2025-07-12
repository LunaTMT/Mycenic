import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { toast } from "react-toastify";
import { usePage } from "@inertiajs/react";
import axios from "axios";

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
  images?: { id: number; image_path: string }[];  // <-- Add this
  isAdmin?: boolean;
  likes?: number;
  dislikes?: number;
  parent_id?: number | null;
  rating?: number;
  itemId: number;
}


interface ReviewsContextType {
  reviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  reviewsPerPage: number;
  totalPages: number;
  currentReviews: Review[];
  handleSortChange: (value: string) => void;

  reviewText: string;
  setReviewText: Dispatch<SetStateAction<string>>;
  rating: number;
  setRating: Dispatch<SetStateAction<number>>;
  errors: { review?: string };
  setErrors: Dispatch<SetStateAction<{ review?: string }>>;
  processing: boolean;
  submitReview: (
    authUser: any,
    category: string,
    rating: number
  ) => Promise<boolean>;
  MAX_LENGTH: number;

  openReplyFormId: string | null;
  setOpenReplyFormId: Dispatch<SetStateAction<string | null>>;
  toggleReplyForm: (id: string) => void;
  showReplyForm: (id: string) => boolean;

  expandedIds: Set<string>;
  toggleExpandedId: (id: string) => void;

  addReply: (reviewId: string, replyText: string) => Promise<void>;
  refreshReviews: () => Promise<void>;

  updateReview: (reviewId: number, newText: string) => Promise<boolean>;
  deleteReview: (reviewId: number) => Promise<boolean>;

  isEditingId: string | null;
  setIsEditingId: Dispatch<SetStateAction<string | null>>;
  editedText: string;
  setEditedText: Dispatch<SetStateAction<string>>;
  cancelEdit: () => void;

  confirmingDeleteId: string | null;
  setConfirmingDeleteId: Dispatch<SetStateAction<string | null>>;
  closeDeleteModal: () => void;

  deleting: boolean;
  setDeleting: Dispatch<SetStateAction<boolean>>;

  showForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = usePage().props as any;

  axios.defaults.withCredentials = true;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortByState] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const reviewsPerPage = 5;

  const [reviewText, setReviewText] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [errors, setErrors] = useState<{ review?: string }>({});
  const [processing, setProcessing] = useState<boolean>(false);

  const MAX_LENGTH = 300;

  const [openReplyFormId, setOpenReplyFormId] = useState<string | null>(null);
  const toggleReplyForm = (id: string) =>
    setOpenReplyFormId((curr) => (curr === id ? null : id));
  const showReplyForm = (id: string) => openReplyFormId === id;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpandedId = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>("");

  const cancelEdit = () => {
    setEditedText("");
    setIsEditingId(null);
  };

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const closeDeleteModal = () => setConfirmingDeleteId(null);

  const [deleting, setDeleting] = useState<boolean>(false);

  // NEW: showForm state
  const [showForm, setShowForm] = useState<boolean>(false);

  const refreshReviews = async () => {
    try {
      const response = await axios.get<Review[]>("/reviews");
      const mapped = response.data.map((r) => ({
        ...r,
        replies_recursive: r.replies_recursive || [],
      }));
      setReviews(mapped);
    } catch (err) {
      console.error("[ReviewsProvider] Failed to load reviews:", err);
      toast.error("Failed to load reviews.");
    }
  };

  useEffect(() => {
    refreshReviews();
  }, []);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) =>
      sortBy === "newest"
        ? +new Date(b.created_at) - +new Date(a.created_at)
        : +new Date(a.created_at) - +new Date(b.created_at)
    );
  }, [reviews, sortBy]);

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const currentReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    return sortedReviews.slice(start, start + reviewsPerPage);
  }, [sortedReviews, currentPage]);

  const setSortBy = (v: "newest" | "oldest") => {
    setSortByState(v);
    setCurrentPage(1);
  };

  const handleSortChange = (v: string) => setSortBy(v as "newest" | "oldest");

  const addReply = async (reviewId: string, replyText: string) => {
    if (!auth?.user?.id) {
      toast.error("Login required");
      return;
    }

    try {
      await axios.post(`/reviews/${reviewId}/reply`, { content: replyText });
      setOpenReplyFormId(null);
      setExpandedIds((prev) => new Set(prev).add(reviewId));
      await refreshReviews();
      toast.success("Reply submitted!");
    } catch (err) {
      toast.error("Reply failed.");
      console.error("Add reply error", err);
    }
  };

  const updateReview = async (
    reviewId: number,
    newText: string
  ): Promise<boolean> => {
    try {
      await axios.put(`/reviews/${reviewId}`, { content: newText });
      toast.success("Review updated!");
      await refreshReviews();
      setIsEditingId(null);
      setEditedText("");
      return true;
    } catch (error: any) {
      toast.error("Failed to update review.");
      console.error("Update review error:", error?.response?.data || error);
      return false;
    }
  };

  const deleteReview = async (reviewId: number): Promise<boolean> => {
    try {
      await axios.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted");
      await refreshReviews();
      setConfirmingDeleteId(null);
      return true;
    } catch (error: any) {
      toast.error("Failed to delete review.");
      console.error("Delete review error:", error?.response?.data || error);
      return false;
    }
  };

  const submitReview = async (
    authUser: any,
    category: string,
    rating: number
  ): Promise<boolean> => {
    setErrors({});
    if (!reviewText.trim()) {
      setErrors({ review: "Please enter your review." });
      return false;
    }

    if (reviewText.length > MAX_LENGTH) {
      setErrors({ review: `Max ${MAX_LENGTH} chars.` });
      return false;
    }

    if (!authUser) {
      toast.error("Login required");
      return false;
    }

    if (!category) {
      toast.error("Category required");
      return false;
    }

    if (rating <= 0) {
      toast.error("Rating required");
      return false;
    }

    setProcessing(true);

    try {
      await axios.post("/reviews", {
        content: reviewText,
        category,
        rating,
      });
      toast.success("Review submitted!");
      setReviewText("");
      setRating(0);
      await refreshReviews();
      return true;
    } catch (err) {
      toast.error("Submit failed");
      console.error("Submit review error:", err);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        setReviews,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        reviewsPerPage,
        totalPages,
        currentReviews,
        handleSortChange,
        setProcessing,
        reviewText,
        setReviewText,
        rating,
        setRating,
        errors,
        setErrors,
        processing,
        submitReview,
        MAX_LENGTH,

        openReplyFormId,
        setOpenReplyFormId,
        toggleReplyForm,
        showReplyForm,

        expandedIds,
        toggleExpandedId,

        addReply,
        refreshReviews,

        updateReview,
        deleteReview,

        isEditingId,
        setIsEditingId,
        editedText,
        setEditedText,
        cancelEdit,

        confirmingDeleteId,
        setConfirmingDeleteId,
        closeDeleteModal,

        deleting,
        setDeleting,

        showForm,
        setShowForm,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = (): ReviewsContextType => {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error("useReviews must be used within a ReviewsProvider");
  return context;
};
