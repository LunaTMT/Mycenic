import React from "react";

export default function AuthorImage({
  author,
  profileImage,
  date,
}: {

  profileImage: string;
  date: string;
}) {
  return (
    <div className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
      <img src={profileImage} alt={`${author}'s profile`} className="absolute top-0 left-0 w-full h-full object-cover" />
   
    </div>
  );
}
