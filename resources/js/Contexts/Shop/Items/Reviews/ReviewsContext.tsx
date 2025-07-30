import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Review } from "@/types/types";

type SortOption = "newest" | "oldest" | "most_liked" | "least_liked";

interface ReviewContextType {
  reviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  fetchReviews: () => void;
  toggleLike: (id: number) => void;
  toggleDislike: (id: number) => void;
  currentReviews: Review[];
  showForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  addReply: (parentId: number, content: string) => void;
  expandedIds: number[];
  toggleExpandedId: (id: number) => void;
  openReplyFormId: number | null;
  setOpenReplyFormId: Dispatch<SetStateAction<number | null>>;
  showReplyForm: (id: number) => boolean;
  showDropdown: number | null;
  setShowDropdown: Dispatch<SetStateAction<number | null>>;
  sortBy: SortOption;
  handleSortChange: (value: SortOption) => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewsProvider = ({
  children,
  initialReviews,
}: {
  children: React.ReactNode;
  initialReviews: Review[];
}) => {
  const { props } = usePage();
  const auth = props.auth;

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);

  const [expandedIds, setExpandedIds] = useState<number[]>(() => {
    const stored = localStorage.getItem("expandedReviewIds");
    return stored ? JSON.parse(stored) : [];
  });

  const [openReplyFormId, setOpenReplyFormId] = useState<number | null>(() => {
    const stored = localStorage.getItem("openReplyFormId");
    return stored ? JSON.parse(stored) : null;
  });

  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const stored = localStorage.getItem("reviewSortBy");
    return (stored as SortOption) || "newest";
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const stored = localStorage.getItem("reviewCurrentPage");
    return stored ? parseInt(stored) : 1;
  });

  const reviewsPerPage = 5;

  const fetchReviews = async () => {
    try {
      const response = await fetch("/reviews");
      if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      const data: Review[] = await response.json();
      setReviews(data);
    } catch (error) {
      toast.error("Failed to fetch reviews");
      console.error(error);
    }
  };

  const toggleLike = async (id: number) => {
    try {
      await router.post(`/reviews/${id}/like`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          setReviews((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    liked: !r.liked,
                    disliked: false,
                    likes: r.liked ? r.likes - 1 : r.likes + 1,
                    dislikes: r.disliked ? r.dislikes - 1 : r.dislikes,
                  }
                : r
            )
          );
        },
        onError: () => toast.error("Failed to like the review."),
      });
    } catch {
      toast.error("Failed to like the review.");
    }
  };

  const toggleDislike = async (id: number) => {
    try {
      await router.post(`/reviews/${id}/dislike`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          setReviews((prev) =>
            prev.map((r) =>
              r.id === id
                ? {
                    ...r,
                    disliked: !r.disliked,
                    liked: false,
                    dislikes: r.disliked ? r.dislikes - 1 : r.dislikes + 1,
                    likes: r.liked ? r.likes - 1 : r.likes,
                  }
                : r
            )
          );
        },
        onError: () => toast.error("Failed to dislike the review."),
      });
    } catch {
      toast.error("Failed to dislike the review.");
    }
  };

  const addReply = (parentId: number, content: string) => {
    router.post(`/reviews/${parentId}/reply`, { content }, {
      onSuccess: () => {
        fetchReviews();
        setOpenReplyFormId(null);
        toast.success("Reply added");
      },
      onError: () => toast.error("Failed to add reply"),
      preserveScroll: true,
    });
  };

  const toggleExpandedId = (id: number) => {
    setExpandedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem("expandedReviewIds", JSON.stringify(updated));
      return updated;
    });
  };

  const showReplyForm = (id: number) => openReplyFormId === id;

  useEffect(() => {
    localStorage.setItem("reviewCurrentPage", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    if (openReplyFormId === null) {
      localStorage.removeItem("openReplyFormId");
    } else {
      localStorage.setItem("openReplyFormId", JSON.stringify(openReplyFormId));
    }
  }, [openReplyFormId]);

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
    localStorage.setItem("reviewSortBy", value);
  };

  const topLevelReviews = useMemo(() => {
    return reviews.filter((r) => r.parent_id === null);
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    return [...topLevelReviews].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "most_liked":
          return b.likes - a.likes;
        case "least_liked":
          return a.likes - b.likes;
        default:
          return 0;
      }
    });
  }, [topLevelReviews, sortBy]);

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const currentReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    return sortedReviews.slice(start, start + reviewsPerPage);
  }, [sortedReviews, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages]);

  const contextValue = useMemo(() => ({
    reviews,
    setReviews,
    fetchReviews,
    toggleLike,
    toggleDislike,
    currentReviews,
    showForm,
    setShowForm,
    addReply,
    expandedIds,
    toggleExpandedId,
    openReplyFormId,
    setOpenReplyFormId,
    showReplyForm,
    showDropdown,
    setShowDropdown,
    sortBy,
    handleSortChange,
    currentPage,
    setCurrentPage,
    totalPages,
  }), [
    reviews,
    currentReviews,
    showForm,
    expandedIds,
    openReplyFormId,
    showDropdown,
    sortBy,
    currentPage,
    totalPages,
  ]);

  return (
    <ReviewContext.Provider value={contextValue}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
};
