import React, { useEffect, useState } from "react";
import { FaUserShield } from "react-icons/fa";

import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

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
  const isAdmin = review.user?.role === "admin";

  const adminIconClasses =
    `absolute bottom-1 right-1 
    bg-yellow-500 text-white 
    dark:bg-[#7289da] 
    rounded-full p-1 
    shadow-[0_0_1px_#FFD700,0_0_3px_#FFD700,0_0_5px_#FFD700]
    dark:shadow-[0_0_2px_#93c5fd,0_0_4px_#60a5fa,0_0_6px_#2563eb]`;


  return (
    <div className="flex items-start flex-shrink-0 space-x-2">
      {avatarUrl ? (
        <div className="relative w-28 h-28">
          <img
            src={avatarUrl}
            alt={`${userName}'s avatar`}
            className="w-28 h-28 rounded-md object-cover border border-gray-300 dark:border-gray-600"
          />
          {isAdmin && (
            <FaUserShield
              title="Admin"
              className={adminIconClasses}
              size={30}
              aria-label="Admin user"
            />
          )}
        </div>
      ) : (
        <div className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 flex items-center justify-center text-4xl font-bold bg-gray-100 dark:bg-gray-700">
          {userName[0]}
          {isAdmin && (
            <FaUserShield
              title="Admin"
              className={adminIconClasses}
              size={20}
              aria-label="Admin user"
            />
          )}
        </div>
      )}
    </div>
  );
}
