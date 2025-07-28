import React from "react";
import Avatar from "../Reviews/Card/Content/Avatar";
import ActionButtons from "../Reviews/Card/Content/ActionButtons";
import { Reply } from "@/types/types";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface ReplyCardProps {
  reply: Reply;
  depth?: number;
}

export default function ReplyCard({ reply, depth = 0 }: ReplyCardProps) {
  const { expandedIds } = useReviews();

  const replyId = reply.id?.toString() ?? "";
  const isExpanded = expandedIds.has(replyId);

  return (
    <div
      className={`relative p-3 space-y-3 rounded-lg bg-gray-50 dark:bg-[#2c2f33]/60`}
      style={{ marginLeft: depth * 12 }}
    >
      <div className="flex space-x-3">
        <Avatar user={reply.user} /> {/* You might want to adjust Avatar to accept user or review */}
        <div className="flex-1 break-words">
          <div className="flex flex-col justify-between space-y-2">
            <p className="font-semibold">{reply.user.name}</p>
            <p>{reply.content}</p>
            <ActionButtons reply={reply} /> {/* You might need a version of ActionButtons for reply */}
          </div>
        </div>
      </div>

      {/* Render nested replies */}
      {isExpanded && reply.replies && reply.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {reply.replies.map((nestedReply) => (
            <ReplyCard key={nestedReply.id} reply={nestedReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
