import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
} from "react";
import { usePage } from "@inertiajs/react";
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

interface Image {
  id: number;
  image_path: string;
  file?: File; // present if newly added image
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
  submitReview: () => Promise<boolean>;
  MAX_LENGTH: number;

  openReplyFormId: string | null;
  setOpenReplyFormId: Dispatch<SetStateAction<string | null>>;
  toggleReplyForm: (id: string) => void;
  showReplyForm: (id: string) => boolean;

  expandedIds: Set<string>;
  toggleExpandedId: (id: string) => void;

  addReply: (reviewId: string, replyText: string) => Promise<void>;
  refreshReviews: () => Promise<void>;

  updateReview: (
    reviewId: number,
    newText: string,
    newRating: number,
    newImages: File[],
    deletedImageIds: number[]
  ) => Promise<boolean>;
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

  imagesByReviewId: Record<number, Image[]>;
  addImage: (reviewId: number, file: File) => void;
  removeImage: (reviewId: number, id: number) => void;

  deletedImageIdsByReviewId: Record<number, number[]>;
  markImageForDeletion: (reviewId: number, imageId: number) => void;
  unmarkImageForDeletion: (reviewId: number, imageId: number) => void;

  getEditedTextById: (id: number) => string;
  setEditedTextById: (id: number, value: string) => void;
  getEditedRatingById: (id: number) => number;
  setEditedRatingById: (id: number, value: number) => void;

  saveReviewChanges: (reviewId: number, newFiles: File[], deletedIds: number[]) => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = usePage().props as any;
  axios.defaults.withCredentials = true;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortByState] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const reviewsPerPage = 5;

  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<{ review?: string }>({});
  const [processing, setProcessing] = useState(false);
  const MAX_LENGTH = 300;

  const [openReplyFormId, setOpenReplyFormId] = useState<string | null>(null);
  const toggleReplyForm = (id: string) => setOpenReplyFormId((curr) => (curr === id ? null : id));
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

  const [editedTextById, setEditedTextByIdState] = useState<Record<number, string>>({});
  const [editedRatingById, setEditedRatingByIdState] = useState<Record<number, number>>({});

  const getEditedTextById = (id: number) => editedTextById[id] ?? "";

  const setEditedTextById = (id: number, value: string) => {
    setEditedTextByIdState((prev) => {
      const prevValue = prev[id] ?? "";
      console.log(`[ReviewsContext] setEditedTextById called for id=${id}: previous="${prevValue}", new="${value}"`);
      return { ...prev, [id]: value };
    });
  };

  const getEditedRatingById = (id: number) => editedRatingById[id] ?? 0;

  const setEditedRatingById = (id: number, value: number) => {
    setEditedRatingByIdState((prev) => {
      const prevValue = prev[id] ?? 0;
      console.log(`[ReviewsContext] setEditedRatingById called for id=${id}: previous=${prevValue}, new=${value}`);
      return { ...prev, [id]: value };
    });
  };

  const cancelEdit = () => {
    setIsEditingId(null);
  };

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const closeDeleteModal = () => setConfirmingDeleteId(null);

  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [imagesByReviewId, setImagesByReviewId] = useState<Record<number, Image[]>>({});
  const [deletedImageIdsByReviewId, setDeletedImageIdsByReviewId] = useState<Record<number, number[]>>({});
  const deletedImageIdsRef = useRef<Record<number, number[]>>({});

  const [category, setCategory] = useState<string>("");
  const [itemId, setItemId] = useState<number>(0);

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && reviews.length > 0) {
      const initialTexts: Record<number, string> = {};
      const initialRatings: Record<number, number> = {};
      reviews.forEach((review) => {
        if (review.id !== undefined) {
          initialTexts[review.id] = review.content;
          initialRatings[review.id] = review.rating ?? 0;
        }
      });
      setEditedTextByIdState(initialTexts);
      setEditedRatingByIdState(initialRatings);
      initialized.current = true;
    }
  }, [reviews]);

  const addImage = (reviewId: number, file: File) => {
    console.log("Adding image to reviewId:", reviewId, file);
    const newImage: Image = {
      id: Date.now() * -1,
      image_path: URL.createObjectURL(file),
      file,
    };
    setImagesByReviewId((prev) => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), newImage],
    }));
  };

  const removeImage = (reviewId: number, id: number) => {
    setImagesByReviewId((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).filter((img) => img.id !== id),
    }));
  };

  const markImageForDeletion = (reviewId: number, imageId: number) => {
    setDeletedImageIdsByReviewId((prev) => {
      const prevDeleted = prev[reviewId] || [];
      return {
        ...prev,
        [reviewId]: [...new Set([...prevDeleted, imageId])],
      };
    });
  };

  const unmarkImageForDeletion = (reviewId: number, imageId: number) => {
    setDeletedImageIdsByReviewId((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).filter((id) => id !== imageId),
    }));
  };

  const refreshReviews = async () => {
    try {
      const response = await axios.get<Review[]>("/reviews");
      const loaded = response.data.map((r) => ({
        ...r,
        itemId: r.itemId,
        replies_recursive: r.replies_recursive || [],
      }));

      setReviews(loaded);

      setImagesByReviewId((prevImagesByReviewId) => {
        const newImagesByReviewId: Record<number, Image[]> = {};

        loaded.forEach((review) => {
          const serverImages = (review.images || []).map((img) => ({
            id: img.id,
            image_path: img.image_path,
          }));

          const localNewImages = (prevImagesByReviewId[review.id!] || []).filter((img) => img.id < 0);

          newImagesByReviewId[review.id!] = [...serverImages, ...localNewImages];
        });

        return newImagesByReviewId;
      });

      setDeletedImageIdsByReviewId({});
    } catch {
      toast.error("Failed to load reviews.");
    }
  };

  useEffect(() => {
    refreshReviews();
  }, []);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) =>
      sortBy === "newest"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [reviews, sortBy]);

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const currentReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    return sortedReviews.slice(start, start + reviewsPerPage);
  }, [sortedReviews, currentPage]);

  const setSortBy = (value: "newest" | "oldest") => {
    setSortByState(value);
    setCurrentPage(1);
  };
  const handleSortChange = (value: string) => setSortBy(value as "newest" | "oldest");

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
    } catch {
      toast.error("Reply failed.");
    }
  };

  const updateReview = async (
    reviewId: number,
    newText: string,
    newRating: number,
    newFiles: File[],
    deletedImageIds: number[]
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("_method", "PUT"); // Spoof PUT method
      formData.append("content", newText);
      formData.append("rating", newRating.toString());

      newFiles.forEach((file, index) => {
        console.log(`[Upload] File ${index}: name=${file.name}, type=${file.type}`);
        formData.append(`images[${index}]`, file);
      });

      deletedImageIds.forEach((id, index) => {
        formData.append(`deleted_image_ids[${index}]`, id.toString());
      });

      // Do NOT set Content-Type manually, let Axios handle boundaries
      await axios.post(`/reviews/${reviewId}`, formData);

      return true;
    } catch (err) {
      console.error("Error uploading images:", err);
      return false;
    }
  };

  const deleteReview = async (reviewId: number) => {
    try {
      await axios.delete(`/reviews/${reviewId}`);
      await refreshReviews();
      toast.success("Review deleted");
      setConfirmingDeleteId(null);
      return true;
    } catch {
      toast.error("Delete failed.");
      return false;
    }
  };

  const submitReview = async () => {
    setErrors({});

    if (!reviewText.trim()) {
      setErrors({ review: "Please enter your review." });
      return false;
    }

    if (reviewText.length > MAX_LENGTH) {
      setErrors({ review: `Max ${MAX_LENGTH} characters.` });
      return false;
    }

    if (!auth?.user || !category || rating <= 0) {
      toast.error("All fields required.");
      return false;
    }

    setProcessing(true);
    try {
      await axios.post("/reviews", {
        content: reviewText,
        category,
        rating,
        itemId,
      });

      setReviewText("");
      setRating(0);
      await refreshReviews();
      toast.success("Review submitted");
      return true;
    } catch {
      toast.error("Submit failed");
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const saveReviewChanges = async (reviewId: number) => {
    try {
      const content = getEditedTextById(reviewId);
      const rating = getEditedRatingById(reviewId);
      const deletedIds = deletedImageIdsByReviewId[reviewId] || [];
      const allImages = imagesByReviewId[reviewId] || [];

      const newFiles = allImages
        .filter((img) => img.id < 0 && img.file)
        .map((img) => img.file as File);

      const success = await updateReview(
        reviewId,
        content,
        rating,
        newFiles,
        deletedIds
      );

      if (success) {
        setIsEditingId(null);
        setEditedTextById(reviewId, "");
        setEditedRatingById(reviewId, 0);
        setDeletedImageIdsByReviewId((prev) => ({
          ...prev,
          [reviewId]: [],
        }));
      }
    } catch (error) {
      console.error("Error saving review changes:", error);
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
        editedText: "",
        setEditedText: () => {},
        cancelEdit,
        confirmingDeleteId,
        setConfirmingDeleteId,
        closeDeleteModal,
        deleting,
        setDeleting,
        showForm,
        setShowForm,
        imagesByReviewId,
        addImage,
        removeImage,
        deletedImageIdsByReviewId,
        markImageForDeletion,
        unmarkImageForDeletion,
        getEditedTextById,
        setEditedTextById,
        getEditedRatingById,
        setEditedRatingById,
        saveReviewChanges,
        category,
        setCategory,
        itemId,
        setItemId,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = (): ReviewsContextType => {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
};
