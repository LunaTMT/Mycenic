import React from "react";
import { usePage } from "@inertiajs/react";
import ReplyForm from "../../Components/ReplyForm";
import Avatar from "./Content/Avatar";
import ReviewHeader from "./Content/ReviewHeader";
import ReviewBody from "./Content/ReviewBody";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import RepliesCard from "../../Replies/RepliesCard";
import LikeDislikeButtons from "../../Components/LikeDislikeButtons";
import Dropdown from "@/Components/Dropdown/Dropdown";
import { Review } from "@/types/types";
import { BsThreeDots } from "react-icons/bs";
import DeleteConfirmationModal from "../../Components/ImageGallery/DeleteConfirmationModal";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface PageProps {
  auth: {
    user: { id: number; name: string; email: string; is_admin: boolean } | null;
  };
}

interface ReviewCardProps {
  review: Review;
  depth?: number;
}

export default function ReviewCard({ review, depth = 0 }: ReviewCardProps) {
  const {
    openReplyFormId,
    setOpenReplyFormId,
    expandedIds,
    toggleExpandedId,
    localRepliesMap,
    addReply,
    showDropdownId,
    setShowDropdown,
    deleteConfirmId,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    deleting,
    startEditing,
    editingReviewId,
    cancelEditing,
    saveEditedReview,
  } = useReviews();

  const { auth } = usePage<PageProps>().props;

  const reviewId = review.id?.toString() ?? "";

  const isOwner = auth.user?.id === review.user?.id;
  const isAdmin = auth.user?.is_admin ?? false;
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const isExpanded = expandedIds.has(reviewId);
  const isReplyFormOpen = openReplyFormId === reviewId;
  const localReplies = localRepliesMap[reviewId] ?? review.replies ?? [];
  const dropdownOpen = showDropdownId === reviewId;
  const isConfirmingDelete = deleteConfirmId === reviewId;

  const isEditing = editingReviewId === reviewId;

  // Handlers
  const handleEdit = () => {
    console.log(`[Edit] Starting edit for Review ID: ${reviewId}`);
    startEditing(reviewId, review);
  };

  const handleCancelEdit = () => {
    console.log(`[Edit] Cancel editing for Review ID: ${reviewId}`);
    cancelEditing();
  };

  const handleSaveEdit = () => {
    console.log(`[Edit] Saving changes for Review ID: ${reviewId}`);
    saveEditedReview(reviewId);
  };

  const handleDelete = () => {
    console.log(`[Delete] Requesting delete confirmation for Review ID: ${reviewId}`);
    openDeleteConfirm(reviewId);
  };

  const toggleReplyForm = () => {
    const newState = isReplyFormOpen ? null : reviewId;
    console.log(`[ReplyForm] Toggling reply form for Review ID: ${reviewId} to ${newState ? "OPEN" : "CLOSED"}`);
    setOpenReplyFormId(newState);
  };

  const toggleExpand = () => {
    console.log(`[Expand] Toggling replies for Review ID: ${reviewId} (currently ${isExpanded ? "expanded" : "collapsed"})`);
    toggleExpandedId(reviewId);
  };

  return (
    <div
      className={`relative p-4 space-y-4 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60 ${
        depth > 0
          ? "ml-3 pl-4 border-l-4 border-yellow-500 dark:border-[#7289da]"
          : "border border-black/20 dark:border-white/20"
      }`}
      style={{ marginLeft: depth * 12 }}
    >
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <Avatar review={review} />
        </div>

        <div className="flex-1 break-words">
          <div className="relative min-h-[100px] flex flex-col flex-1 justify-between">
            <div className="space-y-2">
              <ReviewHeader review={review} expanded={isExpanded} toggleExpanded={toggleExpand} />

              <ReviewBody review={review} />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap items-center">
                  {isEditing ? (
                    <>
                      <PrimaryButton
                        onClick={handleSaveEdit}
                        className="text-[13px] font-semibold px-3 py-1"
                      >
                        Save
                      </PrimaryButton>
                      <SecondaryButton
                        onClick={handleCancelEdit}
                        className="text-[13px] font-semibold px-3 py-1"
                      >
                        Cancel
                      </SecondaryButton>
                    </>
                  ) : (
                    <>
                      <PrimaryButton
                        onClick={toggleReplyForm}
                        className="text-[13px] font-semibold px-3 py-1"
                      >
                        Reply
                      </PrimaryButton>

                      {localReplies.length > 0 && (
                        <SecondaryButton
                          onClick={toggleExpand}
                          className="text-[13px] font-semibold px-3 py-1"
                        >
                          {isExpanded ? "Hide Replies" : `Show (${localReplies.length})`}
                        </SecondaryButton>
                      )}

                      {canEdit && (
                        <PrimaryButton
                          onClick={handleEdit}
                          className="text-[13px] font-semibold px-3 py-1"
                        >
                          Edit
                        </PrimaryButton>
                      )}

      
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <LikeDislikeButtons
                    reviewId={review.id!}
                    initialLikes={review.likes || 0}
                    initialDislikes={review.dislikes || 0}
                  />

                  <Dropdown
                    onOpenChange={(open) => {
                      console.log(`[Dropdown] ${open ? "Opened" : "Closed"} for Review ID: ${reviewId}`);
                      setShowDropdown(open ? reviewId : null);
                    }}
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

                  <DeleteConfirmationModal
                    show={isConfirmingDelete}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {isReplyFormOpen && !isEditing && (
        <div className="mt-2">
          <ReplyForm
            review={review}
            onSubmit={(text) => {
              console.log(`[Reply] Adding reply to Review ID: ${reviewId} with text: "${text}"`);
              addReply(reviewId, text, auth.user);
            }}
          />
        </div>
      )}

      {isExpanded && localReplies.length > 0 && (
        <RepliesCard replies={localReplies} depth={depth + 1} />
      )}
    </div>
  );
}
