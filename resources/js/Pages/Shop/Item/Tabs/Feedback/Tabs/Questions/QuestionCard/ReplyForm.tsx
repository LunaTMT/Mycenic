import React, { useState, useRef, useEffect, FormEventHandler } from "react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton"; // import your SecondaryButton here
import InputLabel from "@/Components/Login/InputLabel";
import InputError from "@/Components/Login/InputError";
import { toast } from "react-toastify";
import { FaChevronRight } from "react-icons/fa";

const MAX_LENGTH = 300;

interface ReplyFormProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export default function ReplyForm({ onSubmit, onCancel }: ReplyFormProps) {
  const [replyText, setReplyText] = useState("");
  const [errors, setErrors] = useState<{ reply?: string }>({});
  const [expanded, setExpanded] = useState(true); // start expanded by default
  const [processing, setProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const toggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = toggleRef.current;
    if (!el) return;

    const onFocus = () => setIsOpen(true);
    const onBlur = () => setIsOpen(false);

    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);

    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
    };
  }, []);

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
      toast.success("Reply submitted!");
      setReplyText("");
      setProcessing(false);
      setExpanded(false);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setReplyText(e.target.value);
      if (errors.reply) setErrors({});
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-[#1e2124]/30 mt-2">
      <div
        ref={toggleRef}
        onClick={() => setExpanded((prev) => !prev)}
        className={`w-full flex items-center cursor-pointer select-none p-3 ${
          expanded ? "rounded-t-lg border-b-0" : "rounded-lg"
        } border border-black/20 dark:border-white/20 bg-white dark:bg-[#1e2124]/30 transition`}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
      >
        <h4 className="text-md font-semibold text-gray-900 dark:text-white">
          {expanded ? "Write a Reply" : "Reply"}
        </h4>
        <FaChevronRight
          className={`ml-auto text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
          size={16}
          aria-hidden="true"
        />
      </div>

      {expanded && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 border border-t-0 border-black/20 dark:border-white/20 rounded-b-lg bg-white dark:bg-[#1e2124]/30"
        >
          <div>
            <InputLabel htmlFor="reply-text" value="Your Reply" />
            <textarea
              id="reply-text"
              name="reply-text"
              rows={4}
              value={replyText}
              onChange={handleChange}
              placeholder="Write your reply here..."
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] px-4 py-3 text-gray-900 dark:text-gray-100 shadow-sm resize-none"
            />
            <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
              <InputError message={errors.reply} />
              <span>
                {replyText.length} / {MAX_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <PrimaryButton disabled={processing} type="submit" >
              Submit Reply
            </PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={onCancel}
             
              disabled={processing}
            >
              Cancel
            </SecondaryButton>
          </div>
        </form>
      )}
    </div>
  );
}
