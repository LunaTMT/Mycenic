import React, { useState } from "react";
import QuestionForm from "./QuestionForm";
import QuestionCard from "./QuestionCard/Card";
import exampleQuestions from "./questionsData";

import SortByDropdown from "./SortByDropdown"; // Reuse or create one for questions
import { Question } from "./questionsData";

export default function Questions() {
  const [localQuestions, setLocalQuestions] = useState<Question[]>(exampleQuestions);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const questionsPerPage = 5;

  const sortedQuestions = [...localQuestions].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
    return 0;
  });

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = sortedQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(sortedQuestions.length / questionsPerPage);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <QuestionForm setQuestions={setLocalQuestions} />

      <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-[#2c2f33]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Customer Questions</h2>
          <SortByDropdown sortBy={sortBy} onSortChange={handleSortChange} />
        </div>

        <div className="space-y-2">
          {currentQuestions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No questions yet.</p>
          ) : (
            currentQuestions.map((q, index) => <QuestionCard key={index} question={q} />)
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
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
