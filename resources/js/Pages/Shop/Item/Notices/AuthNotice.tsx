import React from "react";

interface AuthNoticeProps {
  comment?: string;
}

export default function AuthNotice({ comment = "leave a comment" }: AuthNoticeProps) {
  return (
    <div className="rounded-lg text-gray-600 dark:text-gray-300">
      You must{" "}
      <a href="/login" className="underline font-semibold">
        sign in
      </a>{" "}
      to {comment}.
    </div>
  );
}
