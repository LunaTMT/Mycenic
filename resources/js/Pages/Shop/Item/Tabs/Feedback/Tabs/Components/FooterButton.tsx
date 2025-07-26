import React from "react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface Props {
  review: Review;
}

export default function FooterButtons({ review }: Props) {
  const {
    isEditingId,
    setOpenReplyFormId,
    setIsEditingId,
    cancelEdit,
    setEditedTextById,
    setEditedRatingById,
    clearImagesForReview,
    saving,
    toggleExpandedId,
    expandedIds,
  } = useReviews();

  const id = review.id?.toString() || "";
  const isEditing = isEditingId === id;
  const expanded = expandedIds.has(id);
  const repliesCount = review.replies_recursive?.length || 0;

  function handleCancelEdit() {
    cancelEdit();
    setIsEditingId(null);
    setEditedTextById(review.id!, review.content ?? "");
    setEditedRatingById(review.id!, review.rating ?? 0);
    clearImagesForReview(review.id!);
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {isEditing ? (
        <>
          <PrimaryButton
            onClick={() => undefined /* You can add save handler here if needed */}
            disabled={saving}
            className="text-[13px] font-semibold px-3 py-1"
          >
            {saving ? "Saving..." : "Save"}
          </PrimaryButton>
          <SecondaryButton
            onClick={handleCancelEdit}
            disabled={saving}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Cancel
          </SecondaryButton>
        </>
      ) : (
        <>
          <PrimaryButton
            onClick={() => setOpenReplyFormId(id)}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Reply
          </PrimaryButton>
          {repliesCount > 0 && (
            <SecondaryButton
              onClick={() => toggleExpandedId(id)}
              className="text-[13px] font-semibold px-3 py-1"
            >
              {expanded ? "Hide Replies" : `Show (${repliesCount})`}
            </SecondaryButton>
          )}
        </>
      )}
    </div>
  );
}
