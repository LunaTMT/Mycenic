import { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

interface LikeDislikeButtonsProps {
  initialLikes: number;
  initialDislikes: number;
}

export default function LikeDislikeButtons({ initialLikes, initialDislikes }: LikeDislikeButtonsProps) {
  const [voted, setVoted] = useState<"like" | "dislike" | null>(null);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);

  const toggleVote = (type: "like" | "dislike") => {
    if (voted === type) {
      if (type === "like") setLikes((prev) => prev - 1);
      else setDislikes((prev) => prev - 1);
      setVoted(null);
    } else {
      if (voted === "like") setLikes((prev) => prev - 1);
      if (voted === "dislike") setDislikes((prev) => prev - 1);

      if (type === "like") setLikes((prev) => prev + 1);
      else setDislikes((prev) => prev + 1);

      setVoted(type);
    }
  };

  useEffect(() => {
    setLikes(initialLikes);
    setDislikes(initialDislikes);
  }, [initialLikes, initialDislikes]);

  return (
    <div className="flex justify-end  space-x-4 text-sm">
      <div
        className={`flex items-center cursor-pointer hover:scale-110 transition-transform ${
          voted === "like" ? "text-yellow-500 dark:text-[#7289da]" : "text-gray-600 dark:text-gray-300"
        }`} 
        onClick={() => toggleVote("like")}
        aria-label="Like"
      >
        <FaThumbsUp size={16} />
        <span className="ml-1">{likes}</span>
      </div>

      <div
        className={`flex items-center cursor-pointer hover:scale-110 transition-transform ${
          voted === "dislike" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"
        }`}
        onClick={() => toggleVote("dislike")}
        aria-label="Dislike"
      >
        <FaThumbsDown size={16} />
        <span className="ml-1">{dislikes}</span>
      </div>
    </div>
  );
}
