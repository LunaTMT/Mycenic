import React from "react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { usePage } from "@inertiajs/react";
import { Review } from "@/types/Review";

interface ActionButtonsProps {
  review: Review;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ review }) => {
  const {
    openReplyFormId,
    setOpenReplyFormId,
    reviewEditStates,
    resetReviewEditState,
    addReply,
    updateReview,
    setExpandedId,
    isExpanded,
  } = useReviews();

  const { auth } = usePage().props as { auth: { user: any | null } };

  const reviewId = review.id;
  const editState = reviewEditStates[reviewId];
  const isEditing = editState?.isEditing ?? false;

  const repliesCount = review.replies.length;
  const showAuthNotice = !auth && openReplyFormId === reviewId;

  // ------------------- Editing -------------------
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <PrimaryButton
          onClick={() => updateReview(reviewId)}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Save
        </PrimaryButton>
        <SecondaryButton
          onClick={() => resetReviewEditState(reviewId)}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Cancel
        </SecondaryButton>
      </div>
    );
  }

  // ------------------- Auth notice -------------------
  if (showAuthNotice) {
    return (
      <div className="flex gap-2">
        <PrimaryButton
          onClick={() => setOpenReplyFormId(reviewId)}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Reply
        </PrimaryButton>
        <SecondaryButton
          onClick={() => setOpenReplyFormId(null)}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Cancel
        </SecondaryButton>
      </div>
    );
  }

  // ------------------- Reply form -------------------
  if (openReplyFormId === reviewId && auth) {
    return (
      <div className="flex gap-2">
        <PrimaryButton
          onClick={() => {
            addReply(reviewId);
            setExpandedId(reviewId, true); // Expand parent after replying
          }}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Submit
        </PrimaryButton>
        <SecondaryButton
          onClick={() => setOpenReplyFormId(null)}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Cancel
        </SecondaryButton>
      </div>
    );
  }

  // ------------------- Default buttons -------------------
  return (
    <div className="flex gap-2">
      <PrimaryButton
        onClick={() => setOpenReplyFormId(reviewId)}
        className="text-[13px] font-semibold px-3 py-1"
      >
        Reply
      </PrimaryButton>
      {repliesCount > 0 && (
        <SecondaryButton
          onClick={() => setExpandedId(reviewId, !isExpanded(reviewId))}
          className="text-[13px] font-semibold px-3 py-1"
        >
          {isExpanded(reviewId) ? "Hide Replies" : `Show Replies (${repliesCount})`}
        </SecondaryButton>
      )}
    </div>
  );
};

export default ActionButtons;
