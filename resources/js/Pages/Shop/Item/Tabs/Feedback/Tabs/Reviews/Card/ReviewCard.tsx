import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import { toast } from "react-toastify";

import Avatar from "./Content/Avatar";
import { Review } from "@/types/types";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

import StaticStarRating from "@/Components/Stars/StaticStarRating";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import InputLabel from "@/Components/Login/InputLabel";
import StarRating from "../Form/StarRating";
import ImageGallery from "../../Components/ImageGallery/ImageGallery";

import { FaUserShield } from "react-icons/fa";
import ArrowButton from "@/Components/Icon/ArrowIcon";
import RightActions from "../../Components/RightActions";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";

interface ReviewCardProps {
  review: Review;
  depth?: number;
}

const MAX_LENGTH = 300;

export default function ReviewCard({ review, depth = 0 }: ReviewCardProps) {
  const {
    expandedIds,
    toggleExpandedId,
    openReplyFormId,
    setOpenReplyFormId,
    addReply,
  } = useReviews();

  const reviewId = review.id; //

  const isExpanded = expandedIds.includes(review.id);

  const { auth } = usePage().props as { auth: { user: any | null } };
  const authUser = auth?.user ?? null;


  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(review.content || "");
  const [editedRating, setEditedRating] = useState(Number(review.rating) || 0);

  const [replyText, setReplyText] = useState("");

  const replies = review.replies ?? [];
  const localRepliesCount = replies.length;

  const showAuthNotice = !authUser && openReplyFormId === reviewId;

  function startEditing() {
    setEditedContent(review.content || "");
    setEditedRating(Number(review.rating) || 0);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function saveEditedReview() {
    setIsEditing(false);
  }

  function handleReplyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (e.target.value.length <= MAX_LENGTH) {
      setReplyText(e.target.value);
    }
  }

  function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!replyText.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    if (!authUser) {
      toast.error("You must be logged in to reply.");
      return;
    }

    // Call addReply with review.id (parent review) and replyText (content)
    addReply(review.id, replyText.trim());

    // Optionally clear the reply input and close form immediately,
    // or move these to onSuccess callback inside addReply if you want to wait for server response.
    setReplyText("");
    setOpenReplyFormId(null);
  }


  function handleCancelReply() {
    setOpenReplyFormId(null);
    setReplyText("");
  }

  function handleToggleExpand() {
    toggleExpandedId(reviewId);
  }

  function handleReplyButtonClick() {
    if (authUser) {
      setOpenReplyFormId(openReplyFormId === reviewId ? null : reviewId);
    } else {
      setOpenReplyFormId(reviewId);
    }
  }

  function renderHeader() {
    return (
      <div className="relative flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
            {review.user?.name ?? "Unknown User"}
            {review.user?.isAdmin && (
              <FaUserShield
                className="text-yellow-500 dark:text-[#7289da]"
                title="Admin"
              />
            )}
          </div>
          <ArrowButton
            isOpen={isExpanded}
            onClick={handleToggleExpand}
            w="24"
            h="24"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {review.created_at ? (
            new Date(review.created_at).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          ) : (
            "Unknown date"
          )}
          {/* Only show star rating if this is a top-level review */}
          {review.parent_id === null && (
            <div className="ml-2">
              <StaticStarRating rating={Number(review.rating)} size={14} />
            </div>
          )}
        </div>
      </div>
    );
  }


  function renderReviewContent() {
    if (isEditing) {
      return (
        <>
          <InputLabel
            htmlFor="review"
            value={depth === 0 ? "Your Review" : "Your Reply"}
          />
          <div className="relative text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
            <textarea
              id="review"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Write your review here..."
              rows={5}
              className="resize-none w-full bg-white dark:bg-[#1e2124] text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
              maxLength={MAX_LENGTH}
            />
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                {editedContent.length} / {MAX_LENGTH}
              </div>
              {depth === 0 && (
                <StarRating rating={editedRating} setRating={setEditedRating} />
              )}
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 break-words">
        {review.content}
      </div>
    );
  }

  function renderReplyForm() {
    if (openReplyFormId !== reviewId || !authUser) return null;

    return (
      <form onSubmit={handleReplySubmit} className="space-y-3">
        <div className="relative">
          <InputLabel htmlFor="reply-text" value="Your Reply" />
          <textarea
            id="reply-text"
            name="reply-text"
            rows={5}
            value={replyText}
            onChange={handleReplyChange}
            placeholder="Write your reply here..."
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm resize-none"
          />
          <span className="absolute top-8 right-4 text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
            {replyText.length} / {MAX_LENGTH}
          </span>
        </div>

        <div className="flex gap-2">
          <PrimaryButton
            type="submit"
            className="text-[13px] font-semibold px-3 py-1"
          >
            Submit
          </PrimaryButton>
          <SecondaryButton
            type="button"
            onClick={handleCancelReply}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Cancel
          </SecondaryButton>
        </div>
      </form>
    );
  }

  function renderActionButtons() {
    if (isEditing) {
      return (
        <>
          <PrimaryButton
            onClick={saveEditedReview}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Save
          </PrimaryButton>
          <SecondaryButton
            onClick={cancelEditing}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Cancel
          </SecondaryButton>
        </>
      );
    }

    if (openReplyFormId === reviewId) {
      return null; // Reply form already shows submit/cancel
    }

    return (
      <>
        <PrimaryButton
          onClick={handleReplyButtonClick}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Reply
        </PrimaryButton>
        {localRepliesCount > 0 && (
          <SecondaryButton
            onClick={handleToggleExpand}
            className="text-[13px] font-semibold px-3 py-1"
          >
            {isExpanded ? "Hide Replies" : `Show Replies (${localRepliesCount})`}
          </SecondaryButton>
        )}

      </>
    );
  }

  return (
    <div
      className="relative p-4 space-y-4 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60"
      style={{ marginLeft: depth * 12 }}
    >
      <div className="flex space-x-4">
        <Avatar review={review} />
        <div className="flex-1 break-words">
          <div className="min-h-[100px] flex flex-col justify-between space-y-3">
            {renderHeader()}

            <div className="space-y-2">
              {renderReviewContent()}

              {review.images?.length > 0 && (
                <ImageGallery
                  initialImages={review.images.map((img) => img.image_path)}
                  isEditing={false}
                  maxImages={5}
                />
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              {renderReplyForm()}

              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex gap-2 flex-wrap items-center">
                  {renderActionButtons()}
                </div>

                <div>
                  <RightActions review={review} />
                </div>
              </div>

              {showAuthNotice && <AuthNotice />}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && localRepliesCount > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <ReviewCard key={reply.id} review={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
