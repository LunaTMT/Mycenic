import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import { FaUserShield } from "react-icons/fa";
import ReplyForm from "./ReplyForm";
import QuestionText from "./QuestionText";
import ReplyToggleButtons from "./ReplyToggleButtons";
import LikeDislikeButtons from "./LikeDislikeButtons";
import RepliesList from "./RepliesLists";
import ArrowIcon from "@/Components/Buttons/ArrowIcon";

export interface Question {
  author: string;
  profileImage: string;
  question: string;
  date: string;
  replies?: Question[];
  isAdmin?: boolean;
  likes?: number;
  dislikes?: number;
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

interface QuestionCardProps {
  question: Question;
  depth?: number;
}

export default function QuestionCard({ question, depth = 0 }: QuestionCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [localReplies, setLocalReplies] = useState<Question[]>(question.replies || []);

  const { auth } = usePage<PageProps>().props;
  const isAdmin = auth?.user?.is_admin ?? false;

  function handleReplySubmit(replyText: string) {
    const newReply: Question = {
      author: "Current User",
      profileImage: "https://i.pravatar.cc/150?img=12",
      question: replyText,
      date: new Date().toISOString(),
      replies: [],
      isAdmin: isAdmin,
      likes: 0,
      dislikes: 0,
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
      {/* Arrow icon button top right if there are replies */}
      {localReplies.length > 0 && (
        <button
          type="button"
          aria-label={expanded ? "Collapse replies" : "Expand replies"}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-[#7289da]/30 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-[#7289da]"
        >
          <ArrowIcon isOpen={expanded} w="24" h="24" />
        </button>
      )}

      <div className="flex space-x-4">
        {/* Author image */}
        <div className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
          <img
            src={question.profileImage}
            alt={`${question.author}'s profile`}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>

        {/* Text content */}
        <div className="flex flex-col flex-1 justify-between relative" style={{ minHeight: "100px" }}>
          <div className="flex flex-col flex-grow" style={{ height: "80%" }}>
            {/* Author and Date */}
            <div className="flex flex-col gap-0.5 mb-2">
              <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
                {question.author}
                {question.isAdmin && (
                  <FaUserShield className="text-2xl" title="Admin" aria-label="Admin" />
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(question.date)}
              </span>
            </div>

            {/* Main question text */}
            <QuestionText text={question.question} />
          </div>

          <div className="flex items-end" style={{ height: "20%" }}>
            <ReplyToggleButtons
              showReplyForm={showReplyForm}
              toggleReplyForm={() => setShowReplyForm(!showReplyForm)}
              expanded={expanded}
              toggleExpanded={() => setExpanded(!expanded)}
              repliesCount={localReplies.length}
            />
          </div>

          <div className="absolute bottom-0 right-0">
            <LikeDislikeButtons
              initialLikes={question.likes ?? 0}
              initialDislikes={question.dislikes ?? 0}
            />
          </div>
        </div>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <ReplyForm onSubmit={handleReplySubmit} onCancel={() => setShowReplyForm(false)} />
      )}

      {/* Replies */}
      {expanded && localReplies.length > 0 && (
        <RepliesList replies={localReplies} depth={depth + 1} />
      )}
    </div>
  );
}
