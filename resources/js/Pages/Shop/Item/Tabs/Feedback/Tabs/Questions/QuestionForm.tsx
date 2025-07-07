import React, { useState, FormEventHandler } from "react";
import { usePage } from "@inertiajs/react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import InputLabel from "@/Components/Login/InputLabel";
import InputError from "@/Components/Login/InputError";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "@/Components/Buttons/ArrowIcon";
import { toast } from "react-toastify";
import { FaChevronRight } from "react-icons/fa";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";

const MAX_LENGTH = 300;
const categories = [
  { value: "general", label: "General Question" },
  { value: "shipping", label: "Shipping" },
  { value: "product", label: "Product" },
];

export default function QuestionForm() {
  const { auth } = usePage().props;
  const authUser = auth?.user;

  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("general");
  const [errors, setErrors] = useState<{ question?: string }>({});
  const [processing, setProcessing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategory =
    categories.find((c) => c.value === category)?.label || "Select Category";

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
        <>
          {!authUser ? (
            <div className="p-6 border border-t-0 border-black/20 dark:border-white/20 bg-white dark:bg-[#1e2124]/30">
              <AuthNotice comment="ask a question" />
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="space-y-6 p-6 border border-t-0 border-black/20 dark:border-white/20 rounded-b-lg bg-white dark:bg-[#1e2124]/30"
            >
              <div className="w-full">
                <InputLabel
                  htmlFor="question-category"
                  value="Category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                />
                <div className="relative inline-block w-full ">
                  <Dropdown onOpenChange={setIsOpen}>
                    <Dropdown.Trigger>
                      <div className="flex justify-between items-center min-w-sm px-4 py-2 bg-white dark:bg-[#1e2124] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm cursor-pointer">
                        <span
                          className="text-gray-900 dark:text-gray-100 truncate block max-w-full"
                          title={selectedCategory}
                        >
                          {selectedCategory}
                        </span>
                        <ArrowIcon w="20" h="20" isOpen={isOpen} />
                      </div>
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                      <ul className="w-full bg-white dark:bg-[#424549] text-right shadow-lg z-50 overflow-hidden">
                        {categories.map((cat) => (
                          <li
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-200 dark:hover:bg-[#7289da]/70 text-gray-700 dark:text-gray-300 font-Poppins"
                          >
                            {cat.label}
                          </li>
                        ))}
                      </ul>
                    </Dropdown.Content>
                  </Dropdown>
                </div>
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
                </div>
              </div>

              <div className="flex justify-between ">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {question.length} / {MAX_LENGTH}
                </span>
                <PrimaryButton disabled={processing} className="px-6 py-2 text-md">
                  Submit
                </PrimaryButton>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
