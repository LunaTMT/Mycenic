import React from "react";
import { usePage } from "@inertiajs/react";
import ReplyForm from "../../Components/ReplyForm";
import Avatar from "./Content/Avatar";
import Content from "./Content/ReviewContent";
import ArrowButton from "@/Components/Buttons/ArrowButton";

import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";



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
  const { auth } = usePage<PageProps>().props;
  const {
    setOpenReplyFormId,
    expandedIds,
    toggleExpandedId,
    addReply,
    showReplyForm,
  } = useReviews();



  const replies = review.replies_recursive ?? [];
  const id = review.id?.toString() || review.created_at;
  const isReplyFormOpen = showReplyForm(id);
  const expanded = expandedIds.has(id);

  const handleReply = (text: string) => {
    if (!auth.user) return;
    addReply(id, text);
  };

  return (
    <div
      className={`relative p-4 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60 ${
        depth > 0
          ? "ml-3 pl-4 border-l-4 border-yellow-500 dark:border-[#7289da]"
          : "border border-black/20 dark:border-white/20"
      }`}
      style={{ marginLeft: depth * 12 }}
    >
      {replies.length > 0 && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <ArrowButton
            isOpen={expanded}
            onClick={() => toggleExpandedId(id)}
            w="24"
            h="24"
          />
        </div>
      )}

      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <Avatar review={review} />
        </div>
        <div className="flex-1 break-words">
          <Content review={review} />
        </div>
      </div>


      {expanded && replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <ReviewCard
              key={reply.id?.toString() || reply.created_at}
              review={reply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
