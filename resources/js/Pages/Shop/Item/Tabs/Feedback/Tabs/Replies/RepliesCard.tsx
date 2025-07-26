import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import ReplyForm from "../Components/ReplyForm";
import Avatar from "../Reviews/Card/Content/Avatar";
import ReviewHeader from "../Reviews/Card/Content/ReviewHeader";
import ReviewBody from "../Reviews/Card/Content/ReviewBody";
import RightActions from "../Components/RightActions";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import ArrowButton from "@/Components/Icon/ArrowIcon";

interface PageProps {
  auth: {
    user: { id: number; name: string; email: string; is_admin: boolean } | null;
  };
}

export interface Reply {
  id?: number;
  created_at: string;
  user?: { id: number; name: string };
  content: string;
  replies?: Reply[];
}

interface RepliesCardProps {
  replies: Reply[];
  depth?: number;
}

export default function RepliesCard({ replies, depth = 0 }: RepliesCardProps) {
  const { auth } = usePage<PageProps>().props;
  const [expanded, setExpanded] = useState(true);
  const [isReplyFormOpen, setIsReplyFormOpen] = useState<Record<number, boolean>>({});
  const [localReplies, setLocalReplies] = useState<Reply[]>(replies);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const toggleReplyForm = (id: number) => {
    setIsReplyFormOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReply = (parentId: number, text: string) => {
    if (!auth.user) return;
    const newReply: Reply = {
      id: undefined,
      created_at: new Date().toISOString(),
      content: text,
      user: auth.user,
      replies: [],
    };

    // Add new reply as child of the parent with parentId
    const addReply = (items: Reply[]): Reply[] => {
      return items.map((reply) => {
        if (reply.id === parentId) {
          return {
            ...reply,
            replies: reply.replies ? [...reply.replies, newReply] : [newReply],
          };
        } else if (reply.replies && reply.replies.length > 0) {
          return {
            ...reply,
            replies: addReply(reply.replies),
          };
        }
        return reply;
      });
    };

    setLocalReplies((prev) => addReply(prev));
    setIsReplyFormOpen((prev) => ({ ...prev, [parentId]: false }));
  };

  return (
    <div className="space-y-4">
      {localReplies.map((reply) => {
        const hasReplies = reply.replies && reply.replies.length > 0;
        const isOpen = expanded;
        const isFormOpen = isReplyFormOpen[reply.id ?? 0] ?? false;

        return (
          <div
            key={reply.id ?? reply.created_at}
            className={`relative p-4 space-y-4 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60 ${
              depth > 0
                ? "ml-3 pl-4 border-l-4 border-yellow-500 dark:border-[#7289da]"
                : "border border-black/20 dark:border-white/20"
            }`}
            style={{ marginLeft: depth * 12 }}
          >
            {hasReplies && (
              <div className="absolute top-2 right-2 flex items-center space-x-2">
                <ArrowButton isOpen={isOpen} onClick={toggleExpanded} w="24" h="24" />
              </div>
            )}

            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <Avatar review={reply} />
              </div>
              
              <div className="flex-1 break-words">
                <div className="relative min-h-[100px] flex flex-col flex-1 justify-between">
                  <div className="space-y-2">
                    <ReviewHeader review={reply} />
                    <ReviewBody review={reply} />
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div className="flex gap-2 flex-wrap items-center">
                        <PrimaryButton
                          onClick={() => reply.id && toggleReplyForm(reply.id)}
                          className="text-[13px] font-semibold px-3 py-1"
                        >
                          Reply
                        </PrimaryButton>

                        {hasReplies && (
                          <SecondaryButton
                            onClick={toggleExpanded}
                            className="text-[13px] font-semibold px-3 py-1"
                          >
                            {isOpen ? "Hide Replies" : `Show (${reply.replies?.length})`}
                          </SecondaryButton>
                        )}
                      </div>
                      <RightActions review={reply} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isFormOpen && reply.id && (
              <div className="mt-2">
                <ReplyForm review={reply} onSubmit={(text) => handleReply(reply.id!, text)} />
              </div>
            )}

            {hasReplies && isOpen && reply.replies && (
              <RepliesCard replies={reply.replies} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}
