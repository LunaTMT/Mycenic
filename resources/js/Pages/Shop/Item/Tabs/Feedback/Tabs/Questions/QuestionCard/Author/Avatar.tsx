import React, { useEffect, useState } from "react";
import { Question } from "@/Contexts/Shop/Items/QuestionsContext";

interface AvatarProps {
  question: Question;
}

export default function Avatar({ question }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = question.user?.avatar;
    if (url) {
      const isFullUrl = url.startsWith("http://") || url.startsWith("https://");
      // If relative path, prefix with '/' so browser loads from root public folder
      setAvatarUrl(isFullUrl ? url : `/${url}`);
    } else {
      setAvatarUrl(null);
    }
  }, [question.user]);

  return (
    <div className="flex items-start">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${question.user.name}'s avatar`}
          className="w-28 h-28 rounded-md object-cover border border-gray-300 dark:border-gray-600"
        />

      ) : (
        <div className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 flex items-center justify-center text-4xl font-bold">
          {question.user.name[0] ?? "?"}
        </div>
      )}
    </div>
  );
}
