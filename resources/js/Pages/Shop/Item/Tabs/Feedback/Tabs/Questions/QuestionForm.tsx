import React, { useState, FormEventHandler, useRef, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import InputLabel from "@/Components/Login/InputLabel";
import InputError from "@/Components/Login/InputError";
import { toast } from "react-toastify";
import { FaChevronRight } from "react-icons/fa";

const MAX_LENGTH = 300;

export default function QuestionForm() {
  const { auth } = usePage().props;
  const authUser = auth?.user;

  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("general");
  const [errors, setErrors] = useState<{ question?: string }>({});
  const [processing, setProcessing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const el = selectRef.current;
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

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!question.trim()) {
      setErrors({ question: "Please enter your question." });
      return;
    }

    if (question.length > MAX_LENGTH) {
      setErrors({ question: `Question cannot exceed ${MAX_LENGTH} characters.` });
      return;
    }

    if (!authUser) {
      toast.error("You must be logged in to submit a question.");
      return;
    }

    setProcessing(true);

    // TODO: send question & category & authUser info to backend

    toast.success("Question submitted successfully!");
    setQuestion("");
    setProcessing(false);
    setExpanded(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setQuestion(e.target.value);
      if (errors.question) setErrors({});
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-[#1e2124]/30">
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className={`w-full flex items-center cursor-pointer select-none p-4 ${
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ask a Question
        </h3>
        <FaChevronRight
          className={`ml-auto text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
          size={18}
          aria-hidden="true"
        />
      </div>

      {expanded && (
        <form
          onSubmit={submit}
          className="space-y-6 p-6 border border-t-0 border-black/20 dark:border-white/20 rounded-b-lg bg-white dark:bg-[#1e2124]/30"
        >
          <div className="relative w-full">
            <InputLabel
              htmlFor="question-category"
              value="Category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            />
            <select
              id="question-category"
              ref={selectRef}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] px-4 py-2 pr-10 text-gray-900 dark:text-gray-100 shadow-sm"
            >
              <option value="general">General Question</option>
              <option value="shipping">Shipping</option>
              <option value="product">Product</option>
            </select>
            <span
              className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
            >
              ▼
            </span>
          </div>

          <div>
            <InputLabel htmlFor="question" value="Your Question" />
            <textarea
              id="question"
              name="question"
              value={question}
              onChange={handleChange}
              placeholder="Write your question here..."
              className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] px-4 py-3 text-gray-900 dark:text-gray-100 shadow-sm resize-none"
              rows={5}
            />
            <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
              <InputError message={errors.question} />
              <span>
                {question.length} / {MAX_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <PrimaryButton disabled={processing} className="px-6 py-2 text-lg">
              Submit Question
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}
