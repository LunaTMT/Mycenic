import React, { useState } from "react";
import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard/Card";
import { Question } from "../../Feedback";

const exampleQuestions: Question[] = [
  {
    author: "Alice",
    profileImage: "https://i.pravatar.cc/150?img=1",
    question: "Is this product durable?",
    date: "2025-07-06",
    replies: [
      {
        author: "Bob",
        profileImage: "https://i.pravatar.cc/150?img=2",
        question: "Yes, I've been using it for a year with no issues.",
        date: "2025-07-07",
      },
      {
        author: "Carol",
        profileImage: "https://i.pravatar.cc/150?img=3",
        question: "Mine broke after 6 months, but customer service was great.",
        date: "2025-07-08",
        replies: [
          {
            author: "Dave",
            profileImage: "https://i.pravatar.cc/150?img=4",
            question: "What was the issue exactly?",
            date: "2025-07-09",
          },
        ],
      },
    ],
  },
  {
    author: "Eve",
    profileImage: "https://i.pravatar.cc/150?img=5",
    question: "How long does the battery last on a full charge?",
    date: "2025-07-04",
    replies: [
      {
        author: "Frank",
        profileImage: "https://i.pravatar.cc/150?img=6",
        question: "Around 10 hours with moderate use.",
        date: "2025-07-05",
      },
    ],
  },
  {
    author: "Grace",
    profileImage: "https://i.pravatar.cc/150?img=7",
    question: "Can this be used outdoors in the rain?",
    date: "2025-07-01",
    replies: [
      {
        author: "Heidi",
        profileImage: "https://i.pravatar.cc/150?img=8",
        question: "Yes, it’s water resistant but avoid heavy downpours.",
        date: "2025-07-02",
      },
      {
        author: "Ivan",
        profileImage: "https://i.pravatar.cc/150?img=9",
        question: "I used it in the rain for a week, and it worked fine.",
        date: "2025-07-03",
      },
    ],
  },
];

export default function Questions() {
  const [localQuestions] = useState<Question[]>(exampleQuestions);

  return (
    <div className="space-y-6">
      <QuestionForm />
      
      <div className="border border-black/20 dark:border-white/20 rounded-lg p-6 bg-white dark:bg-[#1e2124]/30 space-y-6">
        {localQuestions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No questions yet.</p>
        ) : (
          localQuestions.map((q, index) => <QuestionCard key={index} question={q} />)
        )}
      </div>
    </div>
  );
}
