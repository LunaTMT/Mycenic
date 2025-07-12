import React, { useState, FormEventHandler } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import InputLabel from "@/Components/Login/InputLabel";
import InputError from "@/Components/Login/InputError";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "@/Components/Buttons/ArrowButton";
import { toast } from "react-toastify";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";
import { useQuestions } from "@/Contexts/Shop/Items/QuestionsContext";

const MAX_LENGTH = 300;
const categories = [
  { value: "general", label: "General Question" },
  { value: "shipping", label: "Shipping" },
  { value: "product", label: "Product" },
];

interface QuestionFormProps {
  onSubmitted?: () => void;
}

export default function QuestionForm({ onSubmitted }: QuestionFormProps) {
  const { auth } = usePage().props;
  const authUser = auth?.user;

  const { refreshQuestions } = useQuestions();

  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("general");
  const [errors, setErrors] = useState<{ question?: string }>({});
  const [processing, setProcessing] = useState(false);
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

    try {
      await axios.post("/questions", { question, category });

      toast.success("Question submitted successfully!");
      setQuestion("");
      refreshQuestions();

      if (onSubmitted) onSubmitted(); // ✅ Close form on submit
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        toast.error("Failed to submit question.");
        console.error(error);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setQuestion(e.target.value);
      if (errors.question) setErrors({});
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-[#1e2124]/30">
      {!authUser ? (
        <div className="p-6 border border-black/20 dark:border-white/20 bg-white dark:bg-[#1e2124]/30">
          <AuthNotice comment="ask a question" />
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="space-y-6 p-6 border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-[#1e2124]/30"
        >
          <div className="w-full">
            <InputLabel
              htmlFor="question-category"
              value="Category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            />
            <div className="relative inline-block w-full">
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

          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {question.length} / {MAX_LENGTH}
            </span>
            <PrimaryButton disabled={processing} className="px-6 py-2 text-md">
              Submit
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}
