import React, { useState } from "react";
import ReplyForm from "./ReplyForm";
import AuthorImage from "./AuthorImage";
import QuestionText from "./QuestionText";
import ReplyToggleButtons from "./ReplyToggleButtons";
import LikeDislikeButtons from "./LikeDislikeButtons";
import RepliesList from "./RepliesLists";

export interface Question {
  author: string;
  profileImage: string;
  question: string;
  date: string;
  replies?: Question[];
}

interface QuestionCardProps {
  question: Question;
  depth?: number;
}

export default function QuestionCard({ question, depth = 0 }: QuestionCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [expanded, setExpanded] = useState(depth === 0 ? false : true);
  const [localReplies, setLocalReplies] = useState<Question[]>(question.replies || []);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [voted, setVoted] = useState<"like" | "dislike" | null>(null);

  function handleReplySubmit(replyText: string) {
    const newReply: Question = {
      author: "Current User",
      profileImage: "https://i.pravatar.cc/150?img=12",
      question: replyText,
      date: new Date().toISOString().slice(0, 10),
      replies: [],
    };

    setLocalReplies([...localReplies, newReply]);
    setShowReplyForm(false);
    setExpanded(true);
  }

  const backgroundByDepth = [
    "bg-white dark:bg-[#1e2124]",
    "bg-gray-50 dark:bg-[#1a1c1e]",
    "bg-gray-100 dark:bg-[#161819]",
    "bg-gray-200 dark:bg-[#131415]",
  ];
  const bgClass = backgroundByDepth[depth] || "bg-gray-300 dark:bg-[#101112]";

  return (
    <div
      className={`p-2 rounded-md ${bgClass} ${
        depth > 0
          ? "ml-3 pl-4 border-l-4 border-blue-300 dark:border-blue-800"
          : "border border-black/20 dark:border-white/20"
      }`}
      style={{ marginLeft: depth * 12 }}
    >
      <div className="flex space-x-4">
        <AuthorImage author={question.author} profileImage={question.profileImage} date={question.date} />

        <div className="flex flex-col flex-1 justify-between">
          <div>
            <QuestionText text={question.question} />
            <ReplyToggleButtons
              showReplyForm={showReplyForm}
              toggleReplyForm={() => setShowReplyForm(!showReplyForm)}
              expanded={expanded}
              toggleExpanded={() => setExpanded(!expanded)}
              repliesCount={localReplies.length}
            />
          </div>

          <LikeDislikeButtons />
        </div>
      </div>

      {showReplyForm && (
        <ReplyForm onSubmit={handleReplySubmit} onCancel={() => setShowReplyForm(false)} />
      )}

      {expanded && localReplies.length > 0 && (
        // Pass depth + 1 here to increase indentation for nested replies
        <RepliesList replies={localReplies} depth={depth + 1} />
      )}
    </div>
  );
}
