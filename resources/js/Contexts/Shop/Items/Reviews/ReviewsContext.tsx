import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Review } from "@/types/types";

interface ReviewContextType {
  reviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  fetchReviews: () => void;
  toggleLike: (id: number) => void;
  toggleDislike: (id: number) => void;

  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  currentReviews: Review[];

  showForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  sortBy: string;
  handleSortChange: (sort: string) => void;

  addReply: (parentId: number, content: string) => void;
  expandedIds: number[];
  toggleExpandedId: (id: number) => void;
  openReplyFormId: number | null;
  setOpenReplyFormId: Dispatch<SetStateAction<number | null>>;
  showReplyForm: (id: number) => boolean;

  showDropdown: number | null;
  setShowDropdown: Dispatch<SetStateAction<number | null>>;
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
  
  const fetchReviews = async () => {
    try {
      const response = await fetch('/reviews');
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }
      const data: Review[] = await response.json();

      // Filter top-level reviews (no parent)
      const filtered = data.filter((r) => r.parent_id === null);

      setReviews(filtered);
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
        onError: () => {
          toast.error("Failed to like the review.");
        },
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
        onError: () => {
          toast.error("Failed to dislike the review.");
        },
      });
    } catch {
      toast.error("Failed to dislike the review.");
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const currentReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
  }, [reviews, currentPage]);

  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("latest");

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  function addReply(parentId: number, content: string) {
    router.post(
      `/reviews/${parentId}/reply`,
      { content },
      {
        onSuccess: () => {
          fetchReviews(); // Refresh review list from server
          setOpenReplyFormId(null);
          toast.success("Reply added");
        },
        onError: () => {
          toast.error("Failed to add reply");
        },
        preserveScroll: true,
      }
    );
  }

  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const toggleExpandedId = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const [openReplyFormId, setOpenReplyFormId] = useState<number | null>(null);
  const showReplyForm = (id: number) => openReplyFormId === id;

  const [showDropdown, setShowDropdown] = useState<number | null>(null);

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
      addReply,
      expandedIds,
      toggleExpandedId,
      openReplyFormId,
      setOpenReplyFormId,
      showReplyForm,
      showDropdown,
      setShowDropdown,
    }),
    [
      reviews,
      currentPage,
      totalPages,
      currentReviews,
      showForm,
      sortBy,
      expandedIds,
      openReplyFormId,
      showDropdown,
    ]
  );

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
