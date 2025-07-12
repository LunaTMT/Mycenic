import React from "react";
import { FaUserShield } from "react-icons/fa";
import formatDate from "@/Functions/formatDate";

interface Props {
  name?: string;
  isAdmin: boolean;
  createdAt: Date;
  rating?: number;
  isEditing: boolean;
  isTopLevel: boolean;
}

export default function ReviewHeader({ name, isAdmin, createdAt, rating, isEditing, isTopLevel }: Props) {
  return (
    <div className="flex flex-col gap-0.5 mb-2">
      <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
        {name ?? "Unknown"}
        {isAdmin && <FaUserShield className="text-2xl" title="Admin" aria-label="Admin" />}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400">{formatDate(createdAt)}</span>
        {isTopLevel && rating && !isEditing && (
          <div className="flex gap-[2px] items-center text-yellow-400 text-sm ml-2">
            {Array.from({ length: rating }).map((_, i) => <span key={i}>★</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
