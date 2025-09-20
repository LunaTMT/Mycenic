import React, { useState } from "react";
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

  // Local loading state for preventing multiple submits
  const [loading, setLoading] = useState(false);

  const handleReply = async () => {
    if (loading) return; // prevent multiple clicks
    setLoading(true);
    try {
      await addReply(reviewId); // assuming this returns a promise
      setExpandedId(reviewId, true);
    } finally {
      setLoading(false);
    }
  };

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
          onClick={handleReply}
          disabled={loading}
          className="text-[13px] font-semibold px-3 py-1"
        >
          {loading ? "Submitting..." : "Submit"}
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
