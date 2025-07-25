import React, { useState, FormEvent, useEffect, useRef } from "react";
import InputLabel from "@/Components/Login/InputLabel";
import InputError from "@/Components/Login/InputError";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

const MAX_LENGTH = 300;

interface Props {
  review: Review;
}

export default function ReplyForm({ review }: Props) {
  const { openReplyFormId, setOpenReplyFormId, addReply } = useReviews();
  const { auth } = usePage().props;
  const authUser = auth?.user;

  const id = review.id?.toString() || "";
  const showReplyForm = openReplyFormId === id;

  const [replyText, setReplyText] = useState("");
  const [replyErrors, setReplyErrors] = useState<{ reply?: string }>({});
  const [replyProcessing, setReplyProcessing] = useState(false);

  const firstRender = useRef(true);

  useEffect(() => {
    if (!showReplyForm && !firstRender.current) {
      // reset when form is closed
      setReplyText("");
      setReplyErrors({});
      setReplyProcessing(false);
    }
    firstRender.current = false;
  }, [showReplyForm]);

  if (!showReplyForm) return null;

  if (!authUser) {
    return (
      <div className="py-4 px-2">
        <p className="text-center text-red-500">Please log in to reply.</p>
      </div>
    );
  }

  function handleReplyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (e.target.value.length <= MAX_LENGTH) {
      setReplyText(e.target.value);
      if (replyErrors.reply) setReplyErrors({});
    }
  }

  async function handleReplySubmit(e: FormEvent) {
    e.preventDefault();
    setReplyErrors({});

    if (!replyText.trim()) {
      setReplyErrors({ reply: "Please enter your reply." });
      return;
    }

    if (replyText.length > MAX_LENGTH) {
      setReplyErrors({ reply: `Reply cannot exceed ${MAX_LENGTH} characters.` });
      return;
    }

    setReplyProcessing(true);

    try {
      await addReply(id, replyText.trim());
      setOpenReplyFormId(null);
      setReplyText("");
    } catch {
      toast.error("Failed to submit reply.");
    } finally {
      setReplyProcessing(false);
    }
  }

  function handleReplyCancel() {
    setOpenReplyFormId(null);
    setReplyText("");
    setReplyErrors({});
    setReplyProcessing(false);
  }

  return (
    <form onSubmit={handleReplySubmit} className="space-y-1">
      <div className="relative">
        <InputLabel htmlFor="reply-text" />
        <textarea
          id="reply-text"
          name="reply-text"
          rows={5}
          value={replyText}
          onChange={handleReplyChange}
          placeholder="Write your reply here..."
          className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm resize-none"
        />
        <div className="mt-1">
          <InputError message={replyErrors.reply} />
        </div>
        <span className="absolute top-4 right-4 text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
          {replyText.length} / {MAX_LENGTH}
        </span>
        </div>
    </form>
  );
}
