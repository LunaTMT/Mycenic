import React from "react";
import { usePage } from "@inertiajs/react";
import ReplyForm from "../../Components/ReplyForm";
import Avatar from "./Content/Avatar";
import ReviewHeader from "./Content/ReviewHeader";
import ReviewBody from "./Content/ReviewBody";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import RepliesCard from "../../Replies/RepliesCard";
import { Review } from "@/types/types";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import RightActions from "../../Components/RightActions";

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
    editingReviewId,
    cancelEditing,
    saveEditedReview,
  } = useReviews();

  const { auth } = usePage<PageProps>().props;

  const reviewId = review.id?.toString() ?? "";

  const isOwner = auth.user?.id === review.user?.id;
  const isEditing = editingReviewId === reviewId;

  const isExpanded = expandedIds.has(reviewId);
  const isReplyFormOpen = openReplyFormId === reviewId;
  const localReplies = localRepliesMap[reviewId] ?? review.replies ?? [];

  // Handlers
  const handleCancelEdit = () => {
    console.log(`[Edit] Cancel editing for Review ID: ${reviewId}`);
    cancelEditing();
  };

  const handleSaveEdit = () => {
    console.log(`[Edit] Saving changes for Review ID: ${reviewId}`);
    saveEditedReview(reviewId);
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

                      {isOwner && (
                        <PrimaryButton
                          onClick={() => startEditing(reviewId, review)}
                          className="text-[13px] font-semibold px-3 py-1"
                        >
                          Edit
                        </PrimaryButton>
                      )}
                    </>
                  )}
                </div>

                {/* Right actions encapsulated */}
                <RightActions review={review} />
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
