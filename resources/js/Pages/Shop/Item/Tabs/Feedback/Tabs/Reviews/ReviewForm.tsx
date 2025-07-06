import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import InputLabel from "@/Components/Login/InputLabel";
import InputError from "@/Components/Login/InputError";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import { toast } from "react-toastify";
import { FaChevronRight } from "react-icons/fa";

import StarRating from "./StarRating";
import { Review } from "../../types";

interface ReviewFormProps {
  rating: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  resetRating: () => void;
  authUser: any;
}

const MAX_LENGTH = 500;

export default function ReviewForm({
  rating,
  setRating,
  setReviews,
  resetRating,
  authUser,
}: ReviewFormProps) {
  const {
    data,
    setData,
    errors,
    processing,
    reset,
    clearErrors,
  } = useForm<{ comment: string }>({
    comment: "",
  });

  const [expanded, setExpanded] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    if (!rating || !data.comment.trim()) {
      toast.error("Please provide a rating and comment.");
      return;
    }

    if (data.comment.length > MAX_LENGTH) {
      toast.error(`Comment must be under ${MAX_LENGTH} characters.`);
      return;
    }

    const newReview: Review = {
      author: authUser.name,
      profileImage: authUser.profile_photo_url || "/default-user.png",
      rating,
      comment: data.comment,
      date: new Date().toLocaleDateString(),
      verified: true,
    };

    setReviews((prev) => [newReview, ...prev]);
    reset();
    resetRating();
    setExpanded(false);
  };

  return (
    <div className="rounded-lg bg-white dark:bg-[#1e2124]/30">
      <div
        onClick={() => setExpanded((prev) => !prev)}
        className={`w-full flex items-center cursor-pointer select-none p-4
          ${expanded ? "rounded-t-lg border-b-0" : "rounded-lg"}
          border border-black/20 dark:border-white/20
          bg-white dark:bg-[#1e2124]/30
          transition`}
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
          Leave a Review
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
          className="space-y-6 p-6 border border-t-0 border-black/20 dark:border-white/20 rounded-b-lg"
        >
          <div>
            <InputLabel htmlFor="comment" />
            <textarea
              id="comment"
              name="comment"
              value={data.comment}
              onChange={(e) => {
                if (e.target.value.length <= MAX_LENGTH) {
                  setData("comment", e.target.value);
                }
              }}
              placeholder="Write your thoughts here..."
              maxLength={MAX_LENGTH}
              className="mt-1 w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-[#1e2124] px-4 py-3 text-gray-900 dark:text-gray-100 shadow-sm focus:border-yellow-400 focus:ring focus:ring-yellow-300 focus:ring-opacity-40 resize-none"
              rows={5}
            />
            <div className="mt-1 text-xs text-left text-gray-500 dark:text-gray-400">
              {data.comment.length} / {MAX_LENGTH}
            </div>
            <InputError message={errors.comment} className="mt-2" />
          </div>

          <div className="flex justify-between gap-20">
            <StarRating rating={rating} setRating={setRating} />
            <PrimaryButton disabled={processing}>
              Submit Review
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}
