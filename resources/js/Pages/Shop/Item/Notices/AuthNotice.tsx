import React from "react";
import { usePage } from "@inertiajs/react";

interface AuthNoticeProps {
  comment?: string;
}

export default function AuthNotice({ comment = "leave a comment" }: AuthNoticeProps) {
  const page = usePage();
  const currentUrl = page.url; // This gives you current full URL

  return (
    <div className="rounded-lg p-4 border border-black/20 dark:border-white/20 text-gray-600 dark:text-gray-300">
      You must{" "}
      <a
        href={`/login?redirect=${encodeURIComponent(currentUrl)}`}
        className="underline font-semibold"
      >
        sign in
      </a>{" "}
      to {comment}.
    </div>
  );
}
