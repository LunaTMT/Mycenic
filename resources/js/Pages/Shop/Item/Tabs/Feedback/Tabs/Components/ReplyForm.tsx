import React, { useState, FormEventHandler } from "react";
import { usePage } from "@inertiajs/react"; // ✅ Required!
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import InputLabel from "@/Components/Login/InputLabel";
import InputError from "@/Components/Login/InputError";
import { toast } from "react-toastify";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";

// Define expected props from Inertia page
interface PageProps {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      is_admin: boolean;
    } | null;
  };
}

interface ReplyFormProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const MAX_LENGTH = 300;



export default function ReplyForm({ onSubmit, onCancel }: ReplyFormProps) {
  const { auth } = usePage<PageProps>().props;
  const authUser = auth.user;

  const [replyText, setReplyText] = useState("");
  const [errors, setErrors] = useState<{ reply?: string }>({});
  const [processing, setProcessing] = useState(false);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setErrors({});

    if (!replyText.trim()) {
      setErrors({ reply: "Please enter your reply." });
      return;
    }

    if (replyText.length > MAX_LENGTH) {
      setErrors({ reply: `Reply cannot exceed ${MAX_LENGTH} characters.` });
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      onSubmit(replyText.trim());
      setReplyText("");
      setProcessing(false);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setReplyText(e.target.value);
      if (errors.reply) setErrors({});
    }
  };

  // 🔒 Show notice if not logged in
  if (!authUser) {
    return (
      <div className="py-4 px-2">
        <AuthNotice />
      </div>
    );
  }


  return (
    <div className="rounded-lg bg-white dark:bg-[#1e2124]/30 mt-2 border border-black/20 dark:border-white/20 p-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <InputLabel htmlFor="reply-text" />
          <textarea
            id="reply-text"
            name="reply-text"
            rows={5}
            value={replyText}
            onChange={handleChange}
            placeholder="Write your reply here..."
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm resize-none"
          />
          <div className="mt-1">
            <InputError message={errors.reply} />
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span className="px-3">
            {replyText.length} / {MAX_LENGTH}
          </span>

          <div className="flex space-x-2">
            <PrimaryButton disabled={processing} className="text-[13px] font-semibold px-3 py-2">
              Submit 
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="text-[13px] font-semibold px-3 py-1"
            >
              Cancel
            </SecondaryButton>
          </div>
        </div>
      </form>
    </div>
  );
}
