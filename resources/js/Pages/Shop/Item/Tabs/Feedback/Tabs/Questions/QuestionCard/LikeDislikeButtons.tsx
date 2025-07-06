import { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";

export default function LikeDislikeButtons() {
  const [voted, setVoted] = useState<"like" | "dislike" | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  function toggleLike() {
    if (voted === "like") {
      setLikes(likes - 1);
      setVoted(null);
    } else {
      if (voted === "dislike") setDislikes(dislikes - 1);
      setLikes(likes + 1);
      setVoted("like");
    }
  }

  function toggleDislike() {
    if (voted === "dislike") {
      setDislikes(dislikes - 1);
      setVoted(null);
    } else {
      if (voted === "like") setLikes(likes - 1);
      setDislikes(dislikes + 1);
      setVoted("dislike");
    }
  }

  return (
    <div className="flex justify-end mt-4 space-x-3">
      <PrimaryButton
        onClick={toggleLike}
        disabled={voted === "like"}
        aria-pressed={voted === "like"}
        aria-label="Like"
        className={`w-24 py-1 px-4 justify-center text-base ${
          voted === "like"
            ? "scale-[103%] shadow-[0_0_3px_#FFD700,0_0_8px_#FFD700,0_0_15px_#FFD700]"
            : ""
        } flex items-center`}
      >
        <FaThumbsUp size={28} className="text-black dark:text-white" />
        <span className="ml-2">{likes}</span>
      </PrimaryButton>

      <SecondaryButton
        onClick={toggleDislike}
        disabled={voted === "dislike"}
        aria-pressed={voted === "dislike"}
        aria-label="Dislike"
        className={`w-24 py-1 px-4 justify-center text-base ${
          voted === "dislike" ? "scale-[103%] opacity-70 cursor-default" : ""
        } flex items-center`}
      >
        <FaThumbsDown size={28} className="text-black dark:text-white" />
        <span className="ml-2">{dislikes}</span>
      </SecondaryButton>
    </div>
  );
}
