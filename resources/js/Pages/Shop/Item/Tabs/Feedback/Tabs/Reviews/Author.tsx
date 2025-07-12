import React, { useEffect, useState } from "react";
import { Review } from "@/Contexts/Shop/Items/ReviewsContext";

interface AvatarProps {
  review: Review;
}

export default function Avatar({ review }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = review.user?.avatar || null;
    if (url) {
      const isFullUrl = url.startsWith("http://") || url.startsWith("https://");
      setAvatarUrl(isFullUrl ? url : `/${url}`);
    } else {
      setAvatarUrl(null);
    }
  }, [review.user]);

  const userName = review.user?.name ?? "?";

  return (
    <div className="flex items-start flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${userName}'s avatar`}
          className="w-28 h-28 rounded-md object-cover border border-gray-300 dark:border-gray-600"
        />
      ) : (
        <div className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 flex items-center justify-center text-4xl font-bold">
          {userName[0]}
        </div>
      )}
    </div>
  );
}
