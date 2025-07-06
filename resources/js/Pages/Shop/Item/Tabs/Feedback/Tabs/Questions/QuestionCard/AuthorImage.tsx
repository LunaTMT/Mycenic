import React from "react";

export default function AuthorImage({
  author,
  profileImage,
  date,
}: {
  author: string;
  profileImage: string;
  date: string;
}) {
  return (
    <div className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
      <img src={profileImage} alt={`${author}'s profile`} className="absolute top-0 left-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-1 text-center text-white text-xs">
        <span className="font-semibold">{author}</span>
        <span className="text-[10px]">{date}</span>
      </div>
    </div>
  );
}
