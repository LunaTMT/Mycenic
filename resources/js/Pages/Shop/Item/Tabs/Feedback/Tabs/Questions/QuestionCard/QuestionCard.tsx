import React from "react";
import { usePage } from "@inertiajs/react";
import ReplyForm from "../../Components/ReplyForm";
import Avatar from "./Author/Avatar";
import Content from "./Content";
import ArrowButton from "@/Components/Buttons/ArrowButton";
import { useQuestions } from "@/Contexts/Shop/Items/QuestionsContext";
import { Question } from "@/Contexts/Shop/Items/QuestionsContext";

interface PageProps {
  auth: { user: { id: number; name: string; email: string; is_admin: boolean } | null };
}

interface QuestionCardProps {
  question: Question;
  depth?: number;
}

export default function QuestionCard({ question, depth = 0 }: QuestionCardProps) {
  const { auth } = usePage<PageProps>().props;
  const {
    openReplyFormId,
    setOpenReplyFormId,
    expandedIds,
    toggleExpandedId,
    addReply,
  } = useQuestions();
  console.log(question);
  const replies = question.replies_recursive ?? []; // ✅ Use recursive replies

  const id = question.id?.toString() || question.date;
  const showReplyForm = openReplyFormId === id;
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
        <ArrowButton
          isOpen={expanded}
          onClick={() => toggleExpandedId(id)}
          w="24"
          h="24"
          className="absolute top-2 right-2"
        />
      )}

      <div className="flex space-x-4">
        <Avatar question={question} />
        <Content question={question} />
      </div>

      {showReplyForm && (
        <ReplyForm onSubmit={handleReply} onCancel={() => setOpenReplyFormId(null)} />
      )}

      {expanded && replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <QuestionCard
              key={reply.id?.toString() || reply.date}
              question={reply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
