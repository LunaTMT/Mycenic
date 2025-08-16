import React, { useState, useRef } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { usePage, router } from "@inertiajs/react";

import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import StarRating from "../Card/Content/StarRating";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

const MAX_LENGTH = 5000;
const MAX_IMAGES = 5;



export default function ReviewForm() {
  const { auth } = usePage().props as { auth: { user: any | null } };
  const authUser = auth?.user ?? null;

  const { item } = useItemContext();
  
  const {fetchReviews, setShowForm, handleSortChange, setCurrentPage } = useReviews()


  const [localContent, setLocalContent] = useState("");
  const [localRating, setLocalRating] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{ review?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    let newFiles: File[] = [];
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (images.length + newFiles.length >= MAX_IMAGES) break;
      const file = files[i];
      newFiles.push(file);
      newUrls.push(URL.createObjectURL(file));
    }

    setImages((prev) => [...prev, ...newFiles]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);
    e.target.value = ""; // reset input
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    
     if (localContent.trim().length === 0) {
       setErrors({ review: "Review content cannot be empty." });
       return;
     }

    if (localRating === 0) {
      setErrors({ review: "Please provide a rating." });
      return;
    }

    setProcessing(true);

    const formData = new FormData();
    formData.append("content", localContent); // can be empty string
    formData.append("rating", localRating.toString());
    formData.append("item_id", item.id.toString());
    images.forEach((file) => formData.append("images[]", file));

    router.post("/reviews", formData, {
      onSuccess: () => {
        toast.success("Review submitted successfully!");
        setLocalContent("");
        setLocalRating(0);
        setImages([]);
        setPreviewUrls([]);
        setProcessing(false);

        // Reset sorting to newest so the new review appears on top
        handleSortChange("newest");

        // Reset to first page to see new reviews
        setCurrentPage(1);

        fetchReviews();
        setShowForm(false);
      },
      onError: (errors) => {
        setErrors(errors);
        toast.error("Failed to submit review.");
        setProcessing(false);
      },
      preserveScroll: true,
    });
  };


  if (!authUser) {
    return (
      <div className="shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60">
        <AuthNotice comment="leave a review" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-4 p-6 border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-[#1e2124]/30"
    >
      {/* Textarea */}
      <div className="relative w-full rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm">
        <textarea
          id="review"
          value={localContent}
          onChange={(e) => {
            if (e.target.value.length <= MAX_LENGTH) setLocalContent(e.target.value);
          }}
          placeholder="Write your review here..."
          rows={5}
          className="resize-none w-full bg-transparent text-gray-900 dark:text-gray-100 px-4 pt-3 pb-20 rounded-md border-none focus:outline-none focus:ring-0 min-h-[200px]"
        />
        <div className="absolute top-4 right-4 text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
          {localContent.length} / {MAX_LENGTH}
        </div>

        {/* Star rating bottom right */}
        <div className="absolute bottom-4 right-4">
          <StarRating rating={localRating} setRating={setLocalRating} size={28} />
        </div>

        {/* Image gallery bottom left */}
        <div className="absolute bottom-4 left-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            <div className="flex flex-wrap gap-3 items-center">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group w-12 h-12 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 cursor-pointer"
                >
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/70 bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1/2 left-1/2 z-10 p-1.5 rounded-full text-white text-xs shadow-md hover:scale-110 transition-transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <FaTrashAlt className="text-2xl" />
                  </button>
                </div>
              ))}

              {previewUrls.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="flex items-center justify-center w-12 h-12 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  aria-label="Add image"
                >
                  <FiUpload size={28} />
                </button>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end mt-4">
        <PrimaryButton type="submit" disabled={processing} className="px-3 py-1.5 text-sm bg-amber-300">
          Submit
        </PrimaryButton>
      </div>

      {errors.review && <span className="text-red-500">{errors.review}</span>}
    </form>
  );
}
