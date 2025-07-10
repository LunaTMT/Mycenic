import React from "react";

interface QuestionHeaderProps {
  author: string;
  profileImage: string;
  date: string;
}

export default function QuestionHeader({ author, profileImage, date }: QuestionHeaderProps) {
  return (
    <div className="flex  bg-red-500 mb-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
      <img
        src={profileImage}
        alt={`${author}'s profile`}
        className="w-full h-full rounded-full mr-4 border-2 border-gray-300 dark:border-gray-600 object-cover"
      />
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{author}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{date}</span>
      </div>
    </div>
  );
}
