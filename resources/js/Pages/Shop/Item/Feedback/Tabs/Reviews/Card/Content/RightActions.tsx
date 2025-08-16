import React, { useState, useMemo } from "react";
import { BsThreeDots } from "react-icons/bs";
import { usePage } from "@inertiajs/react";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import LikeDislikeButtons from "./LikeDislikeButtons";
import Dropdown from "@/Components/Dropdown/Dropdown";
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

  // Check if current user can edit or delete this review
  const canEditOrDelete = useMemo(() => {
    if (!auth?.user) return false;
    return auth.user.is_admin || auth.user.id === review.user.id;
  }, [auth?.user, review.user.id]);

  // Open and close delete confirmation modal
  const openDeleteConfirm = () => setDeleteConfirmId(review.id);
  const closeDeleteConfirm = () => setDeleteConfirmId(null);

  // Confirm deletion of a review
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

      {/* Dropdown for edit/delete actions */}
      {auth.user && canEditOrDelete && (
        <Dropdown>
          <Dropdown.Trigger>
            <div className="flex justify-center items-center cursor-pointer p-1 rounded text-gray-700 dark:text-white/70 hover:text-black dark:hover:text-white">
              <BsThreeDots size={20} />
            </div>
          </Dropdown.Trigger>

          <Dropdown.Content
            width="fit"
            contentClasses="bg-white dark:bg-[#424549] shadow-lg z-50"
          >
            <ul className="text-sm font-Poppins text-right w-full">
              <li
                onClick={() => updateReviewState(review.id, { isEditing: true })}
                className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70"
              >
                Edit
              </li>
              <li
                onClick={openDeleteConfirm}
                className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70"
              >
                Delete
              </li>
            </ul>
          </Dropdown.Content>
        </Dropdown>
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
