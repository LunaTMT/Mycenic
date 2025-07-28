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
  import { router } from "@inertiajs/react";

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

    addReply: (reviewId: string, text: string, user?: any) => void;
    expandedIds: Set<string>;
    toggleExpandedId: (id: string) => void;

    openReplyFormId: string | null;
    setOpenReplyFormId: Dispatch<SetStateAction<string | null>>;
    showReplyForm: (id: string) => boolean;

    showDropdownId: string | null;
    setShowDropdown: Dispatch<SetStateAction<string | null>>;

    deleteConfirmId: string | null;
    openDeleteConfirm: (id: string) => void;
    closeDeleteConfirm: () => void;
    confirmDelete: (id: string) => void;
    deleting: boolean;

    localRepliesMap: { [key: string]: Review[] };

    // Editing state & handlers
    editingReviewId: string | null;
    editedReviewData: {
      [id: string]: { content: string; rating: number };
    };
    // Track new image files added during editing
    newImageFiles: {
      [id: string]: File[];
    };
    // Track IDs of images marked for deletion during editing
    deletedImageIds: {
      [id: string]: number[];
    };
    startEditing: (id: string, current: Review) => void;
    cancelEditing: () => void;
    updateEditedReview: (
      id: string,
      data: Partial<{ content: string; rating: number }>
    ) => void;
    addNewImageFile: (id: string, file: File) => void;
    removeNewImageFile: (id: string, fileIndex: number) => void;
    markImageForDeletion: (id: string, imageId: number) => void;
    unmarkImageForDeletion: (id: string, imageId: number) => void;
    saveEditedReview: (id: string) => Promise<void>;
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

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [openReplyFormId, setOpenReplyFormId] = useState<string | null>(null);
    const [showDropdownId, setShowDropdown] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [localRepliesMap, setLocalRepliesMap] = useState<{ [key: string]: Review[] }>({});

    // Editing state
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editedReviewData, setEditedReviewData] = useState<{
      [id: string]: { content: string; rating: number };
    }>({});

    // New image files selected for each review during editing
    const [newImageFiles, setNewImageFiles] = useState<{ [id: string]: File[] }>({});

    // IDs of existing images marked for deletion per review during editing
    const [deletedImageIds, setDeletedImageIds] = useState<{ [id: string]: number[] }>({});

    const reviewsPerPage = 5;

    const fetchReviews = async () => {
      if (!product?.id) return;
      try {
        const response = await axios.get(`/products/${product.id}/reviews`);
        setReviews(response.data.reviews);
        console.log("[Fetch] Reviews fetched");
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
        console.log(`[Like] Review ${reviewId} liked state updated`);
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
        console.log(`[Dislike] Review ${reviewId} disliked state updated`);
      } catch {
        toast.error("Could not update dislike");
      }
    };

    const addReply = async (reviewId: string, text: string, user?: any) => {
      if (!user) {
        toast.error("Must be logged in to reply");
        return;
      }

      try {
        const response = await axios.post(`/reviews/${reviewId}/reply`, {
          content: text,
        });

        const newReply: Review = response.data;

        setLocalRepliesMap((prev) => ({
          ...prev,
          [reviewId]: prev[reviewId] ? [...prev[reviewId], newReply] : [newReply],
        }));

        setOpenReplyFormId(null);
        toast.success("Reply added successfully");
      } catch (error) {
        toast.error("Failed to add reply");
        console.error(error);
      }
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
      console.log(`[Toggle] Expanded replies for review ${id}`);
    };

    const showReplyForm = (id: string) => openReplyFormId === id;

    const handleSortChange = (value: string) => {
      setSortBy(value);
    };

    const openDeleteConfirm = (id: string) => {
      setDeleteConfirmId(id);
      console.log(`[Delete] Confirm modal opened for review ${id}`);
    };

    const closeDeleteConfirm = () => {
      console.log(`[Delete] Confirm modal closed`);
      setDeleteConfirmId(null);
    };

    const confirmDelete = async (id: string) => {
      setDeleting(true);
      console.log(`[Delete] Deleting review ${id}...`);

      try {
        await axios.delete(`/reviews/${id}`);
        setReviews((prev) => prev.filter((r) => r.id?.toString() !== id));
        toast.success("Review deleted");
        console.log(`[Delete] Deleted review ${id}`);
      } catch (error) {
        toast.error("Failed to delete review");
        console.error(error);
      } finally {
        setDeleting(false);
        setDeleteConfirmId(null);
      }
    };

    // Editing handlers

    const startEditing = (id: string, current: Review) => {
      setEditingReviewId(id);
      setEditedReviewData((prev) => ({
        ...prev,
        [id]: {
          content: current.content,
          rating: current.rating ?? 0,
        },
      }));
      setNewImageFiles((prev) => ({
        ...prev,
        [id]: [],
      }));
      setDeletedImageIds((prev) => ({
        ...prev,
        [id]: [],
      }));
      console.log(`[Edit] Started editing review ${id}`);
    };

    const cancelEditing = () => {
      setEditingReviewId(null);
      console.log(`[Edit] Cancel editing`);
    };

    const updateEditedReview = (
      id: string,
      data: Partial<{ content: string; rating: number }>
    ) => {
      setEditedReviewData((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          ...data,
        },
      }));
      console.log(`[Edit] Updated edited review ${id}`, data);
    };

    // Add new image file to the review being edited
    const addNewImageFile = (id: string, file: File) => {
      setNewImageFiles((prev) => {
        const existingFiles = prev[id] || [];
        return {
          ...prev,
          [id]: [...existingFiles, file],
        };
      });
      console.log(`[Edit] Added new image file for review ${id}`);
    };

    // Remove a new image file before saving
    const removeNewImageFile = (id: string, fileIndex: number) => {
      setNewImageFiles((prev) => {
        const files = prev[id] || [];
        const newFiles = [...files];
        newFiles.splice(fileIndex, 1);
        return {
          ...prev,
          [id]: newFiles,
        };
      });
      console.log(`[Edit] Removed new image file index ${fileIndex} for review ${id}`);
    };

    // Mark an existing image for deletion
    const markImageForDeletion = (id: string, imageId: number) => {
      setDeletedImageIds((prev) => {
        const existing = prev[id] || [];
        if (!existing.includes(imageId)) {
          return {
            ...prev,
            [id]: [...existing, imageId],
          };
        }
        return prev;
      });
      console.log(`[Edit] Marked image ${imageId} for deletion on review ${id}`);
    };

    // Unmark an existing image previously marked for deletion
    const unmarkImageForDeletion = (id: string, imageId: number) => {
      setDeletedImageIds((prev) => {
        const existing = prev[id] || [];
        return {
          ...prev,
          [id]: existing.filter((imgId) => imgId !== imageId),
        };
      });
      console.log(`[Edit] Unmarked image ${imageId} for deletion on review ${id}`);
    };

    const saveEditedReview = (id: string) => {
      const data = editedReviewData[id];
      if (!data) return;

      const formData = new FormData();
      formData.append("content", data.content);
      formData.append("rating", data.rating.toString());

      if (deletedImageIds[id]) {
        deletedImageIds[id].forEach((imageId) => {
          formData.append("deleted_image_ids[]", imageId.toString());
        });
      }

      if (newImageFiles[id]) {
        newImageFiles[id].forEach((file) => {
          formData.append("images[]", file);
        });
      }

      router.post(`/reviews/${id}`, {
        _method: 'put', // ← Laravel will interpret this as a PUT request
        content: data.content,
        rating: data.rating,
        ...(deletedImageIds[id] && {
          deleted_image_ids: deletedImageIds[id],
        }),
        ...(newImageFiles[id] && {
          images: newImageFiles[id],
        }),
      }, {
        forceFormData: true,
        preserveScroll: true,
        onSuccess: (page) => {
          const updatedReview = page.props.flash?.review ?? null;
          if (updatedReview) {
            setReviews((prev) =>
              prev.map((r) => (r.id?.toString() === id ? updatedReview : r))
            );
          }

          setEditingReviewId(null);
          setEditedReviewData((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
          setNewImageFiles((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
          setDeletedImageIds((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });

          toast.success("Review updated successfully");
        },
        onError: (errors) => {
          const messages = Object.values(errors).flat().join("\n");
          toast.error(`Validation error: ${messages}`);
        },
        onFinish: () => {
          console.log(`[Edit] Finished attempt to save review ${id}`);
        },
      });

    };

    useEffect(() => {
      if (!product?.id) return;
      fetchReviews();
    }, [product?.id]);

    const sortedReviews = useMemo(() => {
      const sorted = [...reviews];
      switch (sortBy) {
        case "newest":
          return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
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

        addReply,
        expandedIds,
        toggleExpandedId,
        openReplyFormId,
        setOpenReplyFormId,
        showReplyForm,

        showDropdownId,
        setShowDropdown,

        deleteConfirmId,
        openDeleteConfirm,
        closeDeleteConfirm,
        confirmDelete,
        deleting,

        localRepliesMap,

        editingReviewId,
        editedReviewData,
        newImageFiles,
        deletedImageIds,
        startEditing,
        cancelEditing,
        updateEditedReview,
        addNewImageFile,
        removeNewImageFile,
        markImageForDeletion,
        unmarkImageForDeletion,
        saveEditedReview,
      }),
      [
        reviews,
        currentPage,
        showForm,
        sortBy,
        expandedIds,
        openReplyFormId,
        showDropdownId,
        deleteConfirmId,
        deleting,
        localRepliesMap,
        editingReviewId,
        editedReviewData,
        newImageFiles,
        deletedImageIds,
      ]
    );

    return <ReviewsContext.Provider value={contextValue}>{children}</ReviewsContext.Provider>;
  };

  export const useReviews = () => {
    const context = useContext(ReviewsContext);
    if (!context) throw new Error("useReviews must be used within a ReviewsProvider");
    return context;
  };
