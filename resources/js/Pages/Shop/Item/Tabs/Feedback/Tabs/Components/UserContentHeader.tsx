import React from "react";
import StaticStarRating from "@/Components/Stars/StaticStarRating";
import { FaUserShield } from "react-icons/fa";
import { usePage } from "@inertiajs/react";

import { User } from "@/types";

interface PageProps {
  auth: {
    user: User | null;
  };
}

interface ContentProps {
  id?: number | string;
  created_at: string;
  user?: User | null;
  parent_id?: number | null;
  rating?: number | string | null;
  isAdmin?: boolean;
}

interface Props {
  content: ContentProps;
}

export default function UserContentHeader({ content }: Props) {
  const { auth } = usePage<PageProps>().props;

  if (!content) {
    return <div>Loading...</div>; // fallback UI
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
        {content.user?.name ?? "Unknown"}
        {content.isAdmin && (
          <FaUserShield
            className="text-yellow-500 dark:text-[#7289da]"
            title="Admin"
          />
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {content.created_at ? (
          new Date(content.created_at).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        ) : (
          "Unknown date"
        )}

        {!content.parent_id &&
          content.rating !== undefined &&
          content.rating !== null &&
          !isNaN(Number(content.rating)) && (
            <div className="ml-2">
              <StaticStarRating rating={Number(content.rating)} size={14} />
            </div>
          )}
      </div>
    </div>
  );
}
