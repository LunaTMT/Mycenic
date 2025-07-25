import { useState, useEffect } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { getGuestToken } from '@/utils/guestToken';

interface LikeDislikeButtonsProps {
  reviewId: number;
  initialLikes: number;
  initialDislikes: number;
}

const STORAGE_KEY_PREFIX = "review-vote:";

export default function LikeDislikeButtons({
  reviewId,
  initialLikes,
  initialDislikes,
}: LikeDislikeButtonsProps) {
  const [voted, setVoted] = useState<"like" | "dislike" | null>(null);
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [loading, setLoading] = useState(false);
  const guestToken = getGuestToken();

  useEffect(() => {
    console.log("Mounting LikeDislike");
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${reviewId}`);
    if (saved === "like" || saved === "dislike") {
      setVoted(saved);
    }
  }, [reviewId]);

  // Fetch latest counts from backend
  async function fetchCounts() {
    try {
      const res = await axios.get(`/reviews/${reviewId}`);
      setLikes(res.data.likes);
      setDislikes(res.data.dislikes);
    } catch {
      // silently fail or toast if you want
    }
  }

  const toggleVote = async (type: "like" | "dislike") => {
    if (loading) return;
    if (voted === type) return;

    setLoading(true);

    // Optimistically update UI counts
    let newLikes = likes;
    let newDislikes = dislikes;

    if (voted === "like") newLikes -= 1;
    if (voted === "dislike") newDislikes -= 1;

    if (type === "like") newLikes += 1;
    else newDislikes += 1;

    setLikes(newLikes);
    setDislikes(newDislikes);
    setVoted(type);

    try {
      await axios.post(`/reviews/${reviewId}/vote`, { vote: type, guest_token: guestToken });
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${reviewId}`, type);

      // Refresh counts from backend to avoid desync
      await fetchCounts();
    } catch (err) {
      toast.error("Failed to update vote");
      // Rollback UI
      setLikes(likes);
      setDislikes(dislikes);
      setVoted(voted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end space-x-4 text-sm">
      <div
        className={`flex items-center cursor-pointer hover:scale-110 transition-transform ${
          voted === "like"
            ? "text-yellow-500 dark:text-[#7289da]"
            : "text-gray-600 dark:text-gray-300"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => toggleVote("like")}
        aria-label="Like"
      >
        <FaThumbsUp size={16} />
        <span className="ml-1">{likes}</span>
      </div>

      <div
        className={`flex items-center cursor-pointer hover:scale-110 transition-transform ${
          voted === "dislike"
            ? "text-red-600 dark:text-red-400"
            : "text-gray-600 dark:text-gray-300"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => toggleVote("dislike")}
        aria-label="Dislike"
      >
        <FaThumbsDown size={16} />
        <span className="ml-1">{dislikes}</span>
      </div>
    </div>
  );
}
