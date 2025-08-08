import React from "react";
import { FaUserShield } from "react-icons/fa";
import { Review } from "@/types/types";
import { resolveImageSrc } from "@/utils/resolveImageSrc";

interface AvatarProps {
  review: Review;
}

export default function Avatar({ review }: AvatarProps) {
  const user = review.user;
  console.log(user)
  const userName = user?.name ?? "User";
  const avatarSrc = user?.avatar ?? "/default-avatar.png";
  const isAdmin = user?.role === "admin";

  const adminIconClasses = `
    absolute bottom-1 right-1 
    bg-yellow-500 text-white 
    dark:bg-[#7289da] 
    rounded-full p-1 
    shadow-[0_0_1px_#FFD700,0_0_3px_#FFD700,0_0_5px_#FFD700]
    dark:shadow-[0_0_2px_#93c5fd,0_0_4px_#60a5fa,0_0_6px_#2563eb]
  `;

  return (
    <div className="flex items-start flex-shrink-0 space-x-2">
      <div className="relative w-28 h-28">
        <img
          src={resolveImageSrc(avatarSrc)}
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
    </div>
  );
}
