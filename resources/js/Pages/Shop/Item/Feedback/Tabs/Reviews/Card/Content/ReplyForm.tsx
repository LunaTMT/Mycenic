import React from "react";
import InputLabel from "@/Components/Login/InputLabel";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { usePage } from "@inertiajs/react";
import { User } from "@/types/User";
import { Review } from "@/types/Review";




const MAX_LENGTH = 300;

interface ReplyFormProps {
  review: Review;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ review }) => {
  const {
    replyText,
    setReplyText,
    openReplyFormId,
  } = useReviews();

  const { auth } = usePage().props as { auth: { user: User | null } };
  const authUser = auth?.user ?? null;
  
  if (openReplyFormId !== review.id || !authUser) return null;

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setReplyText(e.target.value);
    }
  };

  return (
    <div className="space-y-3">
      <InputLabel htmlFor="reply-text" value="Your Reply" />
      <div className="relative text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
        <textarea
          id="reply-text"
          name="reply-text"
          rows={5}
          value={replyText}
          onChange={handleReplyChange}
          placeholder="Write your reply here..."
          maxLength={MAX_LENGTH}
          className="resize-none w-full bg-white dark:bg-[#1e2124] text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
        />
        <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
            {replyText.length} / {MAX_LENGTH}
          </div>


        </div>
      </div>
    </div>
  );
};

export default ReplyForm;
