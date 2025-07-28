import React, { FormEvent } from "react";
import InputLabel from "@/Components/Login/InputLabel";
import InputError from "@/Components/Login/InputError";
import { usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Review } from "@/types/types";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";

const MAX_LENGTH = 300;

interface Props {
  review: Review;
  replyText: string;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (text: string) => Promise<void>;
  onCancel?: () => void;
}

export default function ReplyForm({ review, replyText, setReplyText, onSubmit, onCancel }: Props) {
  const { auth } = usePage().props;
  const authUser = auth?.user;

  const [replyErrors, setReplyErrors] = React.useState<{ reply?: string }>({});
  const [replyProcessing, setReplyProcessing] = React.useState(false);

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_LENGTH) {
      setReplyText(val);
      if (replyErrors.reply) setReplyErrors({});
    }
  };

  const handleReplySubmit = async (e: FormEvent) => {
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
      await onSubmit(replyText.trim());
      setReplyText("");
      if (onCancel) onCancel();
    } catch {
      toast.error("Failed to submit reply.");
    } finally {
      setReplyProcessing(false);
    }
  };

  const handleReplyCancel = () => {
    setReplyText("");
    setReplyErrors({});
    if (onCancel) onCancel();
  };



  return (
    <form onSubmit={handleReplySubmit} className="space-y-3">
      <div className="relative">
        <InputLabel htmlFor="reply-text" />
        <textarea
          id="reply-text"
          name="reply-text"
          rows={5}
          value={replyText ?? ""}
          onChange={handleReplyChange}
          placeholder="Write your reply here..."
          className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm resize-none"
          disabled={replyProcessing}
        />
        <div className="mt-1">
          <InputError message={replyErrors.reply} />
        </div>
        <span className="absolute top-4 right-4 text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
          {(replyText ?? "").length} / {MAX_LENGTH}
        </span>
      </div>

    </form>
  );
}
