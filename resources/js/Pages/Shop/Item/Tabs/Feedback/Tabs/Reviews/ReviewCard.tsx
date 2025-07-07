import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import LikeDislikeButtons from "../Questions/QuestionCard/LikeDislikeButtons";
import ReplyForm from "../Questions/QuestionCard/ReplyForm";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import { FaUserShield, FaCheckCircle } from "react-icons/fa";
import { Review } from "./ReviewsData";
import ArrowIcon from "@/Components/Buttons/ArrowIcon";

interface ReviewCardProps {
  review: Review;
  depth?: number;
}

interface PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      is_admin: boolean;
    } | null;
  };
}

export default function ReviewCard({ review, depth = 0 }: ReviewCardProps) {
  const { auth } = usePage<PageProps>().props;
  const isAdmin = auth?.user?.is_admin ?? false;

  const [expanded, setExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [localReplies, setLocalReplies] = useState<Review[]>(review.replies || []);

  function handleReplySubmit(replyText: string) {
    const newReply: Review = {
      author: auth?.user?.name || "Current User",
      profileImage: "https://i.pravatar.cc/150?img=12",
      rating: 0,
      comment: replyText,
      date: new Date().toISOString(),
      verified: !isAdmin,
      isAdmin: isAdmin,
      replies: [],
    };

    setLocalReplies([...localReplies, newReply]);
    setShowReplyForm(false);
    setExpanded(true);
  }

  function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleString(undefined, options);
  }

  return (
    <div
      className={`relative p-4 rounded-lg bg-white dark:bg-[#1e2124]/60 ${
        depth > 0
          ? "ml-3 pl-4 border-l-4 border-yellow-500 dark:border-[#7289da]"
          : "border border-black/20 dark:border-white/20"
      }`}
      style={{ marginLeft: depth * 12 }}
    >
      {/* Arrow icon button top-right if there are replies */}
      {localReplies.length > 0 && (
        <button
          type="button"
          aria-label={expanded ? "Collapse replies" : "Expand replies"}
          onClick={() => setExpanded(!expanded)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-[#7289da]/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-[#7289da]"
        >
          <ArrowIcon isOpen={expanded} w="24" h="24" />
        </button>
      )}

      <div className="flex space-x-4">
        {/* Profile Picture */}
        <div className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
          <img
            src={review.profileImage}
            alt={`${review.author}'s profile`}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>

        {/* Content Block */}
        <div className="flex flex-col flex-1 justify-between relative" style={{ minHeight: "100px" }}>
          <div className="flex flex-col flex-grow" style={{ height: "80%" }}>
            {/* Author and Date */}
            <div className="flex flex-col gap-0.5 text-sm font-semibold text-gray-900 dark:text-white">
              <div className="flex items-center gap-2">
                {review.author}
                {review.isAdmin && (
                  <FaUserShield className="text-2xl" title="Admin" aria-label="Admin" />
                )}
                {review.verified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 rounded-full whitespace-nowrap">
                    <FaCheckCircle />
                    Verified Purchase
                  </span>
                )}
              </div>

              {/* Date */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(review.date)}
              </div>
            </div>

            {/* Star Rating */}
            {depth === 0 && (
              <div className="text-yellow-500 text-sm select-none mt-1">
                {"★".repeat(review.rating)}
                <span className="text-gray-400 dark:text-gray-500">
                  {"★".repeat(5 - review.rating)}
                </span>
              </div>
            )}

            {/* Comment Body */}
            <p className="text-gray-800 dark:text-gray-100 mt-2 text-sm">
              {review.comment}
            </p>
          </div>

          {/* Reply & Expand Buttons */}
          <div className="flex space-x-2 mt-2">
            {(isAdmin || (auth.user && review.verified)) && (
              <PrimaryButton
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-[13px] font-semibold px-3 py-1"
                type="button"
              >
                {showReplyForm ? "Cancel" : "Reply"}
              </PrimaryButton>
            )}

            {localReplies.length > 0 && (
              <SecondaryButton
                onClick={() => setExpanded(!expanded)}
                className="text-[13px] font-semibold px-3 py-1"
                type="button"
              >
                {expanded ? "Hide Replies" : `Show (${localReplies.length})`}
              </SecondaryButton>
            )}
          </div>

          {/* Like/Dislike Buttons */}
          <div className="absolute bottom-0 right-0">
            <LikeDislikeButtons
              initialLikes={review.likes ?? 0}
              initialDislikes={review.dislikes ?? 0}
            />
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {(isAdmin || (auth.user && review.verified)) && showReplyForm && (
        <div className="mt-4">
          <ReplyForm
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Replies */}
      {expanded && localReplies.length > 0 && (
        <div className="mt-4 space-y-4">
          {localReplies.map((reply, i) => (
            <ReviewCard key={i} review={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
