import React, { createContext, useContext, useState, Dispatch, SetStateAction } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Review } from "@/types/Review";
import { Image, LocalImage } from "@/types/Image";

interface ReviewEditState {
  content: string;
  rating: number;
  images: (Image | LocalImage)[];
  deletedImageIds: number[];
  isEditing: boolean;
}

interface ReviewContextType {
  reviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  fetchReviews: () => void;
  toggleLike: (id: number) => void;
  toggleDislike: (id: number) => void;
  showForm: boolean;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  addReply: (parentId: number) => void;
  updateReview: (id: number) => void;
  setReviewIsEditing: (id: number, editing: boolean) => void;
  resetReviewEditState: (id: number) => void;
  expandedIds: number[];
  toggleExpandedId: (id: number) => void;
  setExpandedId: (id: number, expanded: boolean) => void;
  openReplyFormId: number | null;
  setOpenReplyFormId: Dispatch<SetStateAction<number | null>>;
  showReplyForm: (id: number) => boolean;
  showDropdown: number | null;
  setShowDropdown: Dispatch<SetStateAction<number | null>>;
  isExpanded: (id: number) => boolean;
  reviewEditStates: Record<number, ReviewEditState>;
  updateReviewState: (id: number, updater: Partial<ReviewEditState>) => void;
  deleteReview: (id: number) => void;
  replyText: string;
  setReplyText: Dispatch<SetStateAction<string>>;
  clearReplyText: () => void;
  onAddImages: (reviewId: number, files: FileList) => void;
  onDeleteImage: (reviewId: number, imageId: number) => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewsProvider = ({
  children,
  initialReviews,
  itemId = null,
}: {
  children: React.ReactNode;
  initialReviews: Review[];
  itemId?: number | null;
}) => {
  const { props } = usePage();
  const auth = props.auth;

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [openReplyFormId, setOpenReplyFormId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const clearReplyText = () => setReplyText("");

  const flattenReviews = (reviews: Review[]): Review[] => {
    let flat: Review[] = [];
    reviews.forEach((r) => {
      flat.push(r);
      if (r.replies && r.replies.length > 0) flat = flat.concat(flattenReviews(r.replies));
    });
    return flat;
  };

  const [reviewEditStates, setReviewEditStates] = useState<Record<number, ReviewEditState>>(() => {
    const allReviews = flattenReviews(initialReviews);
    return Object.fromEntries(
      allReviews.map((r) => [
        r.id,
        { content: r.content, rating: r.rating || 0, images: r.images || [], deletedImageIds: [], isEditing: false },
      ])
    );
  });

  const updateReviewState = (id: number, updater: Partial<ReviewEditState>) => {
    setReviewEditStates((prev) => ({ ...prev, [id]: { ...prev[id], ...updater } }));
  };

  const setReviewIsEditing = (id: number, editing: boolean) => updateReviewState(id, { isEditing: editing });

  const resetReviewEditState = (id: number) => {
    const original = flattenReviews(reviews).find((r) => r.id === id);
    if (!original) return;
    updateReviewState(id, {
      content: original.content,
      rating: original.rating || 0,
      images: original.images || [],
      deletedImageIds: [],
      isEditing: false,
    });
  };

  // ------------------- Images -------------------
  const maxImages = 5;

  const onAddImages = (reviewId: number, files: FileList) => {
    const state = reviewEditStates[reviewId];
    if (!state) return;

    const remainingSlots = maxImages - state.images.length;
    if (remainingSlots <= 0) return;

    const newFiles = Array.from(files).slice(0, remainingSlots);
    const newImages: LocalImage[] = newFiles.map((file, idx) => ({
      id: -Date.now() - idx,
      imageable_id: reviewId,
      imageable_type: "Review",
      path: URL.createObjectURL(file),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      file,
    }));

    updateReviewState(reviewId, { images: [...state.images, ...newImages] });

    // Update the main reviews array so images show immediately
    setReviews(prev =>
      prev.map(r => r.id === reviewId
        ? { ...r, images: [...(r.images || []), ...newImages] }
        : r
      )
    );
  };

  const onDeleteImage = async (reviewId: number, imageId: number) => {
    const state = reviewEditStates[reviewId];
    if (!state) return;

    const images = state.images.filter((img) => img.id !== imageId);
    const deletedImageIds = imageId > 0 ? [...state.deletedImageIds, imageId] : state.deletedImageIds;

    updateReviewState(reviewId, { images, deletedImageIds });

    setReviews(prev =>
      prev.map(r => r.id === reviewId
        ? { ...r, images }
        : r
      )
    );

    if (deletedImageIds.length > 0) {
      const formData = new FormData();
      deletedImageIds.forEach((id) => formData.append("deleted_image_ids[]", id.toString()));
      formData.append("_method", "PUT");

      await router.post(`/reviews/${reviewId}`, formData, {
        preserveScroll: true,
        forceFormData: true,
        onSuccess: () => updateReviewState(reviewId, { deletedImageIds: [] }),
      });
    }
  };

  // ------------------- Expand / Collapse -------------------
  const toggleExpandedId = (id: number) => setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  const setExpandedId = (id: number, expanded: boolean) => setExpandedIds((prev) => expanded ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((i) => i !== id));
  const isExpanded = (id: number) => expandedIds.includes(id);
  const showReplyForm = (id: number) => openReplyFormId === id;

  // ------------------- Replies -------------------
  const addReply = (parentId: number) => {
    if (!replyText.trim()) return;
    router.post(`/reviews/${parentId}/reply`, { content: replyText.trim() }, {
      onSuccess: () => {
        fetchReviews();
        setOpenReplyFormId(null);
        setExpandedId(parentId, true);
        clearReplyText();
        toast.success("Reply added");
      },
      onError: () => toast.error("Failed to add reply"),
      preserveScroll: true,
    });
  };

  // ------------------- Update / Fetch -------------------
  const fetchReviews = async () => {
    try {
      const query = itemId ? `?item_id=${itemId}` : "";
      const res = await fetch(`/reviews${query}`);
      if (!res.ok) throw new Error(res.statusText);
      const data: Review[] = await res.json();
      setReviews(data);

      const allReviews = flattenReviews(data);
      const newStates: Record<number, ReviewEditState> = {};
      allReviews.forEach((r) => {
        if (!reviewEditStates[r.id]) newStates[r.id] = { content: r.content, rating: r.rating || 0, images: r.images || [], deletedImageIds: [], isEditing: false };
      });
      setReviewEditStates((prev) => ({ ...prev, ...newStates }));
    } catch (err) {
      toast.error("Failed to fetch reviews");
      console.error(err);
    }
  };

  const updateReview = async (id: number) => {
    const state = reviewEditStates[id];
    const review = flattenReviews(reviews).find(r => r.id === id);
    if (!state || !review) return;

    const { content, rating, images, deletedImageIds } = state;
    const formData = new FormData();

    formData.append("content", content);
    if (review.parent_id === null) formData.append("rating", rating.toString());
    formData.append("_method", "PUT");

    images.forEach((img) => "file" in img && formData.append("images[]", img.file));
    deletedImageIds.forEach((id) => formData.append("deleted_image_ids[]", id.toString()));

    try {
      await router.post(`/reviews/${id}`, formData, {
        preserveScroll: true,
        forceFormData: true,
        onSuccess: () => {
          fetchReviews();
          resetReviewEditState(id);
          toast.success("Review updated successfully.");
        },
        onError: () => toast.error("Failed to update review."),
      });
    } catch {
      toast.error("Failed to update review.");
    }
  };

  const toggleReaction = async (id: number, type: "like" | "dislike") => {
    try {
      await router.post(`/reviews/${id}/${type}`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          setReviews((prev) =>
            prev.map((r) => {
              if (r.id !== id) return r;
              const liked = type === "like" ? !r.liked : false;
              const disliked = type === "dislike" ? !r.disliked : false;
              return {
                ...r,
                liked,
                disliked,
                likes: r.liked && type === "like" ? r.likes - 1 : r.likes + (type === "like" ? 1 : 0),
                dislikes: r.disliked && type === "dislike" ? r.dislikes - 1 : r.dislikes + (type === "dislike" ? 1 : 0),
              };
            })
          );
        },
        onError: () => toast.error(`Failed to ${type} the review.`),
      });
    } catch {
      toast.error(`Failed to ${type} the review.`);
    }
  };

  const toggleLike = (id: number) => toggleReaction(id, "like");
  const toggleDislike = (id: number) => toggleReaction(id, "dislike");

  const deleteReview = async (id: number) => {
    try {
      await router.delete(`/reviews/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setReviews((prev) => prev.filter((r) => r.id !== id));
          toast.success("Review deleted successfully.");
        },
        onError: () => toast.error("Failed to delete review."),
      });
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        setReviews,
        fetchReviews,
        toggleLike,
        toggleDislike,
        showForm,
        setShowForm,
        addReply,
        updateReview,
        setReviewIsEditing,
        resetReviewEditState,
        expandedIds,
        toggleExpandedId,
        setExpandedId,
        openReplyFormId,
        setOpenReplyFormId,
        showReplyForm,
        showDropdown,
        setShowDropdown,
        isExpanded,
        reviewEditStates,
        updateReviewState,
        deleteReview,
        replyText,
        setReplyText,
        clearReplyText,
        onAddImages,
        onDeleteImage,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) throw new Error("useReviews must be used within a ReviewsProvider");
  return context;
};
