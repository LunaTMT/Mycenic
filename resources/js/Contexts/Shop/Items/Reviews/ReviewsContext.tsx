import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
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
  file?: File;
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
  deleteReview: (reviewId: number, parentId: number | null) => Promise<boolean>;

  isEditingId: string | null;
  setIsEditingId: Dispatch<SetStateAction<string | null>>;
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

  // New: local editing state (content + rating) per review, managed in context
  localContentById: Record<number, string>;
  setLocalContentById: (id: number, content: string) => void;
  localRatingById: Record<number, number>;
  setLocalRatingById: (id: number, rating: number) => void;

  saving: boolean;
  saveContentForReview: (
    reviewId: number
  ) => Promise<boolean>;

  saveReviewChanges: (reviewId: number) => Promise<void>;

  revertUnsavedImages: (reviewId: number) => void;

  clearImagesForReview: (reviewId: number) => void;

  getDisplayImages: (reviewId: number, isEditing: boolean) => Image[];
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = usePage().props as any;
  axios.defaults.withCredentials = true;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortByState] = useState<"newest" | "oldest" | "most_liked" | "least_liked">("newest");

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

  // Persisted isEditingId state
  const [isEditingIdState, setIsEditingIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isEditingId");
    }
    return null;
  });

  const setIsEditingId = (id: string | null) => {
    setIsEditingIdState(id);
    if (typeof window !== "undefined") {
      if (id === null) {
        localStorage.removeItem("isEditingId");
      } else {
        localStorage.setItem("isEditingId", id);
      }
    }
  };

  const cancelEdit = () => {
    setIsEditingId(null);
  };

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const closeDeleteModal = () => setConfirmingDeleteId(null);

  const [deleting, setDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Images and deleted images per review
  const [imagesByReviewId, setImagesByReviewId] = useState<Record<number, Image[]>>({});
  const [deletedImageIdsByReviewId, setDeletedImageIdsByReviewId] = useState<Record<number, number[]>>({});

  const addImage = (reviewId: number, file: File) => {
    const newImage: Image = {
      id: Date.now() * -1, // negative temporary id
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

  const revertUnsavedImages = (reviewId: number) => {
    setImagesByReviewId((prev) => {
      const savedImages = (prev[reviewId] || []).filter((img) => img.id >= 0);
      return {
        ...prev,
        [reviewId]: savedImages,
      };
    });
    setDeletedImageIdsByReviewId((prev) => {
      const copy = { ...prev };
      delete copy[reviewId];
      return copy;
    });
  };

  const clearImagesForReview = (reviewId: number) => {
    setImagesByReviewId((prev) => ({
      ...prev,
      [reviewId]: [],
    }));
    setDeletedImageIdsByReviewId((prev) => {
      const copy = { ...prev };
      delete copy[reviewId];
      return copy;
    });
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
    return [...reviews].sort((a, b) => {
      const likesA = typeof a.likes === "number" ? a.likes : 0;
      const likesB = typeof b.likes === "number" ? b.likes : 0;
      const dislikesA = typeof a.dislikes === "number" ? a.dislikes : 0;
      const dislikesB = typeof b.dislikes === "number" ? b.dislikes : 0;

      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        case "most_liked":
          return likesB - likesA;

        case "least_liked":
          return dislikesB - dislikesA; // most dislikes first

        default:
          return 0;
      }
    });
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
  
  const handleSortChange = (value: string) => setSortBy(value as "newest" | "oldest" | "most_liked" | "least_liked");


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
  ): Promise<{ success: true } | { success: false; message: string }> => {
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("content", newText.trim());
      formData.append("rating", newRating.toString());

      newFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });

      deletedImageIds.forEach((id, index) => {
        formData.append(`deleted_image_ids[${index}]`, id.toString());
      });

      await axios.post(`/reviews/${reviewId}`, formData);
      await refreshReviews();

      return { success: true };
    } catch (err: any) {
      let message = "Something went wrong.";

      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        message = errors.join(" ");
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      return { success: false, message };
    }
  };


  const deleteReview = async (reviewId: number, parentId: number | null) => {
    try {
      setDeleting(true);
      await axios.delete(`/reviews/${reviewId}`);
      await refreshReviews();
      setDeleting(false);
      return true;
    } catch {
      toast.error("Delete failed");
      setDeleting(false);
      return false;
    }
  };

  // Editing states stored per review id
  const [localContentById, setLocalContentByIdState] = useState<Record<number, string>>({});
  const [localRatingById, setLocalRatingByIdState] = useState<Record<number, number>>({});

  const setLocalContentById = (id: number, content: string) => {
    setLocalContentByIdState((prev) => ({ ...prev, [id]: content }));
  };

  const setLocalRatingById = (id: number, rating: number) => {
    setLocalRatingByIdState((prev) => ({ ...prev, [id]: rating }));
  };

  // Access edited text and rating by id
  const getEditedTextById = (id: number) => localContentById[id] ?? "";
  const getEditedRatingById = (id: number) => localRatingById[id] ?? 0;

  const [editedTextById, setEditedTextByIdState] = useState<Record<number, string>>({});
  const [editedRatingById, setEditedRatingByIdState] = useState<Record<number, number>>({});

  const setEditedTextById = (id: number, value: string) => {
    setEditedTextByIdState((prev) => {
      return { ...prev, [id]: value };
    });
  };

  const setEditedRatingById = (id: number, value: number) => {
    setEditedRatingByIdState((prev) => {
      return { ...prev, [id]: value };
    });
  };

  // Saving state for async operations
  const [saving, setSaving] = useState(false);

  // Save content on blur (or manually)
  const saveContentForReview = async (reviewId: number): Promise<boolean> => {
    const localContent = getEditedTextById(reviewId);
    const localRating = getEditedRatingById(reviewId);
    const images = imagesByReviewId[reviewId] || [];
    const imagesToDelete = deletedImageIdsByReviewId[reviewId] || [];

    setSaving(true);

    // Update edited text/rating to edited storage
    setEditedTextById(reviewId, localContent);
    setEditedRatingById(reviewId, localRating);

    const newFiles = images.filter((img) => img.id < 0 && img.file).map((img) => img.file!) ?? [];

    const success = await updateReview(reviewId, localContent, localRating, newFiles, imagesToDelete);

    setSaving(false);

    if (!success) {
      toast.error("Failed to save review");
    }

    return success;
  };

  const saveReviewChanges = async (reviewId: number) => {
    const success = await saveContentForReview(reviewId);

    if (success) {
      setIsEditingId(null);
      setEditedTextById(reviewId, "");
      setEditedRatingById(reviewId, 0);
      setImagesByReviewId((prev) => ({ ...prev, [reviewId]: [] }));
      setDeletedImageIdsByReviewId((prev) => ({ ...prev, [reviewId]: [] }));
    }
  };

  const submitReview = async (): Promise<boolean> => {
    if (!auth?.user?.id) {
      toast.error("Please log in to submit a review");
      return false;
    }

    if (!reviewText.trim()) {
      setErrors({ review: "Review cannot be empty" });
      return false;
    }

    if (reviewText.length > MAX_LENGTH) {
      setErrors({ review: `Review cannot exceed ${MAX_LENGTH} characters.` });
      return false;
    }

    try {
      setProcessing(true);
      await axios.post("/reviews", { content: reviewText, rating });
      toast.success("Review submitted");
      setReviewText("");
      setRating(0);
      await refreshReviews();
      setProcessing(false);
      return true;
    } catch {
      setProcessing(false);
      toast.error("Failed to submit review");
      return false;
    }
  };

  // Helper: get images to display in review, combining server, new uploads, excluding deleted
  const getDisplayImages = (reviewId: number, isEditing: boolean): Image[] => {
    const backendImages = (reviews.find(r => r.id === reviewId)?.images ?? []).filter(
      (img) => !(deletedImageIdsByReviewId[reviewId] ?? []).includes(img.id)
    );
    const newUploadedImages = (imagesByReviewId[reviewId] ?? []).filter((img) => img.id < 0 && img.file);
    return isEditing ? [...backendImages, ...newUploadedImages] : backendImages;
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

        isEditingId: isEditingIdState,
        setIsEditingId,
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

        localContentById,
        setLocalContentById,
        localRatingById,
        setLocalRatingById,

        saving,
        saveContentForReview,
        saveReviewChanges,

        revertUnsavedImages,
        clearImagesForReview,

        getDisplayImages,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
};
