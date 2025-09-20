import React, { useState, useMemo } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { usePage } from "@inertiajs/react";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import LikeDislikeButtons from "./LikeDislikeButtons";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { Review } from "@/types/Review";
import { User } from "@/types/User";

interface RightActionsProps {
  review: Review;
}

const RightActions: React.FC<RightActionsProps> = ({ review }) => {
  const { auth } = usePage().props as { auth: { user: User | null } };
  const { deleteReview, updateReviewState } = useReviews();

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEditOrDelete = useMemo(() => {
    if (!auth?.user) return false;
    return auth.user.is_admin || auth.user.id === review.user.id;
  }, [auth?.user, review.user.id]);

  const openDeleteConfirm = () => setDeleteConfirmId(review.id);
  const closeDeleteConfirm = () => setDeleteConfirmId(null);

  const confirmDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteReview(id);
      closeDeleteConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 ml-auto">
      {/* Like/dislike buttons */}
      <LikeDislikeButtons
        reviewId={review.id}
        initialLikes={review.likes || 0}
        initialDislikes={review.dislikes || 0}
      />

      {/* Edit/Delete icons */}
      {auth.user && canEditOrDelete && (
        <div className="flex gap-2">
          <button
            onClick={() => updateReviewState(review.id, { isEditing: true })}
            className="p-1 rounded text-gray-700 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Edit Review"
          >
            <FiEdit size={18} />
          </button>

          <button
            onClick={openDeleteConfirm}
            className="p-1 rounded text-gray-700 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Delete Review"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        show={deleteConfirmId === review.id}
        onClose={closeDeleteConfirm}
        onConfirm={() => confirmDelete(review.id)}
        deleting={deleting}
        item="review"
        message="Once deleted, this review and all its replies will be permanently removed."
      />
    </div>
  );
};

export default RightActions;
