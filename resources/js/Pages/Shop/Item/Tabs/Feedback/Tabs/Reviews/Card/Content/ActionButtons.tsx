import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { Review } from "@/types/types";
import ReplyForm from "../../../Components/ReplyForm";
import RightActions from "../../../Components/RightActions";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";



interface ActionButtonsProps {
  review: Review;
}

export default function ActionButtons({ review }: ActionButtonsProps) {
  const {
    editingReviewId,
    cancelEditing,
    saveEditedReview,
    startEditing,
    openReplyFormId,
    setOpenReplyFormId,
    expandedIds,
    toggleExpandedId,
    addReply,
  } = useReviews();

  const { auth } = (usePage() as any).props;

  const authUser = auth.user;

  const reviewId = review.id?.toString() ?? "";
  const localRepliesCount = review.replies?.length || 0;

  const isEditing = editingReviewId === reviewId;
  const isReplyFormOpen = openReplyFormId === reviewId;
  const isExpanded = expandedIds.has(reviewId);

  const [replyText, setReplyText] = useState("");
  const [showAuthNotice, setShowAuthNotice] = useState(false);

  const onReplyToggle = () => {
    if (!authUser) {
      setShowAuthNotice(true);
      return;
    }
    setShowAuthNotice(false);

    setOpenReplyFormId(prevId => (prevId === reviewId ? null : reviewId));
  };

  const onExpandToggle = () => {
    toggleExpandedId(reviewId);
  };

  const onSaveReply = async (text: string) => {
    if (!authUser) return;
    if (!text.trim()) return;

    await addReply(reviewId, text, authUser);
    setOpenReplyFormId(null);
    setReplyText("");
  };

  const onSaveClick = () => {
    if (isEditing) {
      saveEditedReview(reviewId);
    } else if (isReplyFormOpen) {
      onSaveReply(replyText);
    }
  };

  const onCancelEdit = () => {
    cancelEditing();
    setReplyText("");
  };

  const onEditStart = () => {
    startEditing(reviewId, review);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* ReplyForm */}
      {isReplyFormOpen && authUser && (
        <ReplyForm
          review={review}
          replyText={replyText}
          setReplyText={setReplyText}
          onSubmit={onSaveReply}
          onCancel={() => {
            setOpenReplyFormId(null);
            setReplyText("");
          }}
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-2 flex-wrap items-center">
          {isEditing ? (
            <>
              <PrimaryButton
                onClick={onSaveClick}
                className="text-[13px] font-semibold px-3 py-1"
              >
                Save
              </PrimaryButton>
              <SecondaryButton
                onClick={onCancelEdit}
                className="text-[13px] font-semibold px-3 py-1"
              >
                Cancel
              </SecondaryButton>
            </>
          ) : isReplyFormOpen ? (
            <>
              <PrimaryButton
                onClick={onSaveClick}
                className="text-[13px] font-semibold px-3 py-1"
              >
                Submit
              </PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  setOpenReplyFormId(null);
                  setReplyText("");
                }}
                className="text-[13px] font-semibold px-3 py-1"
              >
                Cancel
              </SecondaryButton>
            </>
          ) : (
            <>
              <PrimaryButton
                onClick={onReplyToggle}
                className="text-[13px] font-semibold px-3 py-1"
              >
                Reply
              </PrimaryButton>

              {localRepliesCount > 0 && (
                <SecondaryButton
                  onClick={onExpandToggle}
                  className="text-[13px] font-semibold px-3 py-1"
                >
                  {isExpanded ? "Hide Replies" : `Show Replies (${localRepliesCount})`}
                </SecondaryButton>
              )}

            </>
          )}
        </div>

        {/* Right Actions */}
        <div>
          <RightActions review={review} />
        </div>
      </div>

      {/* Auth Notice only when guest tries to reply */}
      {showAuthNotice && <AuthNotice />}
    </div>
  );
}
