import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import ReplyForm from "../../Components/ReplyForm";
import Avatar from "./Content/Avatar";
import UserContentHeader from "../../Components/UserContentHeader";
import ReviewBody from "./Content/ReviewBody";
import RightActions from "../../Components/RightActions";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import RepliesCard from "../../Replies/RepliesCard"; // nested replies renderer
import ArrowButton from "@/Components/Icon/ArrowIcon";
import { Review } from "@/types/types";

interface PageProps {
  auth: {
    user: { id: number; name: string; email: string; is_admin: boolean } | null;
  };
}

interface ReviewCardProps {
  review: Review;
  depth?: number; // optional depth for nested indentation
}

export default function ReviewCard({ review, depth = 0 }: ReviewCardProps) {
  const { auth } = usePage<PageProps>().props;
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [localReplies, setLocalReplies] = useState<Review[]>(review.replies ?? []);

  const toggleExpanded = () => setExpanded((prev) => !prev);
  const toggleReplyForm = () => setIsReplyFormOpen((prev) => !prev);

  const repliesCount = localReplies.length;

  // Add new reply locally (simulate adding a reply)
  const handleReply = (text: string) => {
    if (!auth.user) return;
    const newReply: Review = {
      id: undefined,
      created_at: new Date().toISOString(),
      content: text,
      user: auth.user,
      replies: [],
    };
    setLocalReplies((prev) => [...prev, newReply]);
    setIsReplyFormOpen(false);
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
      {repliesCount > 0 && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <ArrowButton isOpen={expanded} onClick={toggleExpanded} w="24" h="24" />
        </div>
      )}

      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <Avatar review={review} />
        </div>
        
        <div className="flex-1 break-words">
          <div className="relative min-h-[100px] flex flex-col flex-1 justify-between">
            <div className="space-y-2">
              <UserContentHeader content={review} />
              <ReviewBody review={review} />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap items-center">
                  <PrimaryButton
                    onClick={toggleReplyForm}
                    className="text-[13px] font-semibold px-3 py-1"
                  >
                    Reply
                  </PrimaryButton>

                  {repliesCount > 0 && (
                    <SecondaryButton
                      onClick={toggleExpanded}
                      className="text-[13px] font-semibold px-3 py-1"
                    >
                      {expanded ? "Hide Replies" : `Show (${repliesCount})`}
                    </SecondaryButton>
                  )}
                </div>
                <RightActions review={review} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isReplyFormOpen && (
        <div className="mt-2">
          <ReplyForm review={review} onSubmit={handleReply} />
        </div>
      )}

      {expanded && repliesCount > 0 && (
        <RepliesCard replies={localReplies} depth={depth + 1} />
      )}
    </div>
  );
}
