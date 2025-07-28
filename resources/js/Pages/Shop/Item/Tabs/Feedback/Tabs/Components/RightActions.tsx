import React from "react";
import { usePage } from "@inertiajs/react";
import Dropdown from "@/Components/Dropdown/Dropdown";
import { BsThreeDots } from "react-icons/bs";
import DeleteConfirmationModal from "./ImageGallery/DeleteConfirmationModal";
import LikeDislikeButtons from "./LikeDislikeButtons";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { Review } from "@/types/types";


interface RightActionsProps {
  review: Review;
}

export default function RightActions({ review }: RightActionsProps) {
  const {
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    deleting,
    startEditing,
    editingReviewId,
    setShowDropdown,
    showDropdownId,
    deleteConfirmId,
  } = useReviews();

  const page = usePage();


  const { auth } = page.props as PageProps;


  const reviewId = review.id?.toString() ?? "";

  const isOwner = auth.user?.id === review.user?.id;
  const isAdmin = auth.user?.is_admin ?? false;
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const dropdownOpen = showDropdownId === reviewId;
  const isEditing = editingReviewId === reviewId;

  // Handlers
  const handleEdit = () => {
    console.log(`[Edit] Starting edit for Review ID: ${reviewId}`);
    startEditing(reviewId, review);
  };

  const handleDelete = () => {
    console.log(`[Delete] Requesting delete confirmation for Review ID: ${reviewId}`);
    openDeleteConfirm(reviewId);
  };

  return (
    <div className="flex items-center gap-3 ml-auto ">
      <LikeDislikeButtons
        reviewId={reviewId}
        initialLikes={review.likes || 0}
        initialDislikes={review.dislikes || 0}
      />

      {auth.user && (
        <Dropdown
          onOpenChange={(open) => {
            console.log(`[Dropdown] ${open ? "Opened" : "Closed"} for Review ID: ${reviewId}`);
            setShowDropdown(open ? reviewId : null);
          }}
          open={dropdownOpen}
        >
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
              {(isOwner && canEdit) || isAdmin ? (
                <li
                  onClick={handleEdit}
                  className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70"
                >
                  Edit
                </li>
              ) : null}

              {canDelete && (
                <li
                  onClick={handleDelete}
                  className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70"
                >
                  Delete
                </li>
              )}
            </ul>
          </Dropdown.Content>
        </Dropdown>
      )}

      <DeleteConfirmationModal
        show={deleteConfirmId === reviewId}
        onClose={() => {
          console.log(`[DeleteModal] Closed for Review ID: ${reviewId}`);
          closeDeleteConfirm();
        }}
        onConfirm={() => {
          console.log(`[DeleteModal] Confirmed deletion for Review ID: ${reviewId}`);
          confirmDelete(reviewId);
        }}
        deleting={deleting}
        item="review"
        message="Once deleted, this review and all its replies will be permanently removed."
      />
    </div>
  );
}
