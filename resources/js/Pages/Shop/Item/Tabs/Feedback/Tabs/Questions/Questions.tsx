import React, { useState } from "react";
import QuestionForm from "./QuestionForm";
import SortByDropdown from "./SortByDropdown";
import SortByCategory from "./SortByCategory";
import QuestionCard from "./QuestionCard/QuestionCard";
import { QuestionsProvider, useQuestions } from "@/Contexts/Shop/Items/QuestionsContext";

function QuestionsContent() {
  const { currentQuestions, currentPage, setCurrentPage, totalPages } = useQuestions();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-md">
        <div className="flex justify-between items-center mb-4">
          {/* Add Question button on the left */}
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="px-3 py-1 bg-yellow-500 dark:bg-[#7289da] text-white rounded-md text-sm font-semibold hover:brightness-110 transition"
          >
            {showForm ? "Close" : "Add Question"}
          </button>

          {/* Sort dropdowns on the right */}
          <div className="flex gap-2 items-center">
            <SortByCategory />
            <SortByDropdown />
          </div>
        </div>

        {showForm && <QuestionForm onSubmitted={() => setShowForm(false)} />}

        {currentQuestions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No questions yet.</p>
        ) : (
          <div className="space-y-4">
            {currentQuestions.map((q) => (
              <QuestionCard key={q.id || q.created_at} question={q} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentPage === i + 1
                    ? "bg-yellow-500 dark:bg-[#7289da] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Questions() {
  return (
    <QuestionsProvider>
      <QuestionsContent />
    </QuestionsProvider>
  );
}
