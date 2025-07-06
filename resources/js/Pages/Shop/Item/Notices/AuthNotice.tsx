import React from "react";

export default function AuthNotice() {
  return (
    <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 p-4 text-yellow-800 dark:text-yellow-300">
      You must{" "}
      <a href="/login" className="underline font-semibold">
        sign in
      </a>{" "}
      to leave a comment.
    </div>
  );
}
