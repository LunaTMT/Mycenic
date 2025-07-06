import React from "react";
import QuestionCard from "./Card";
import { Question } from "./Card";

interface RepliesListProps {
  replies: Question[];
  depth?: number;
}

export default function RepliesList({ replies, depth = 1 }: RepliesListProps) {
  return (
    <div className="mt-3 space-y-3">
      {replies.map((reply, index) => (
        // pass depth + 1 to increase indentation for nested replies
        <QuestionCard key={index} question={reply} depth={depth} />
      ))}
    </div>
  );
}
