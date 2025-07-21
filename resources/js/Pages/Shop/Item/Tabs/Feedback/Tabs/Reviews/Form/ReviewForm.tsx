  import React, { useState, FormEventHandler, useRef, useEffect } from "react";
  import { usePage } from "@inertiajs/react";
  import PrimaryButton from "@/Components/Buttons/PrimaryButton";
  import InputLabel from "@/Components/Login/InputLabel";
  import { toast } from "react-toastify";
  import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";
  import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
  import axios from "axios";
  import { FiUpload } from "react-icons/fi";
  import { FaTrashAlt } from "react-icons/fa";
  import StarRating from "./StarRating";
  import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";

  const MAX_IMAGES = 5;

  interface ReviewFormProps {
    onSubmitSuccess?: () => void;
    review?: {
      id: number;
      content: string;
      rating: number;
      images?: { image_path: string }[];
      parent_id?: number | null;
    };
  }

  export default function ReviewForm({ onSubmitSuccess, review }: ReviewFormProps) {
    const { auth } = usePage().props;
    const authUser = auth?.user;

    const {
      errors,
      setErrors,
      MAX_LENGTH,
      refreshReviews,
      setShowForm,
    } = useReviews();

    const { item } = useItemContext();

    const [processing, setProcessing] = useState(false);
    const [localContent, setLocalContent] = useState(review?.content || "");
    const [localRating, setLocalRating] = useState(review?.rating || 0);
    const [images, setImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>(
      review?.images?.map((img) => img.image_path) || []
    );

    useEffect(() => {
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });

      const newUrls = images.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...(review?.images?.map((i) => i.image_path) || []), ...newUrls]);

      return () => {
        newUrls.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [images]);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const selectedFiles = Array.from(e.target.files);
      const combinedFiles = [...images, ...selectedFiles].slice(0, MAX_IMAGES);
      if (combinedFiles.length > MAX_IMAGES) toast.error(`You can upload up to ${MAX_IMAGES} images only.`);
      setImages(combinedFiles);
    };

    const handleRemoveImage = (index: number) => {
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
      setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit: FormEventHandler = async (e) => {
      e.preventDefault();
      setErrors({});

      if (localRating === 0) return toast.error("Please select a rating.");
      if (!localContent.trim()) return setErrors({ review: "Review cannot be empty." });
      if (localContent.length > MAX_LENGTH) return setErrors({ review: `Review cannot exceed ${MAX_LENGTH} characters.` });

      const formData = new FormData();
      formData.append("content", localContent);
      formData.append("rating", localRating.toString());
      formData.append("item_id", item.id.toString());
      images.forEach((image) => formData.append("images[]", image));

      setProcessing(true);
      try {
        if (review) {
          await axios.post(`/reviews/${review.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Review updated!");
        } else {
          await axios.post("/reviews", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Review submitted!");
        }

        setLocalContent("");
        setLocalRating(0);
        setImages([]);
        refreshReviews();
        onSubmitSuccess?.();
        setShowForm?.(false);
      } catch (error: any) {
        if (error.response?.status === 409) {
          toast.error("You have already submitted a review for this item.");
        } else if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          toast.error("Failed to submit review.");
        }
      } finally {
        setProcessing(false);
      }
    };

    return (
      <div className="rounded-lg bg-white dark:bg-[#1e2124]/30">
        {!authUser ? (
          <div className="p-6 border rounded-lg border-black/20 dark:border-white/20 bg-white dark:bg-[#1e2124]/30">
            <AuthNotice comment="leave a review" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-6 border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-[#1e2124]/30"
          >

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
              {/* Char counter - top right */}
              <div className="absolute top-4 right-4 text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                {localContent.length} / {MAX_LENGTH}
              </div>

              {/* Star rating - bottom left */}
              <div className="absolute bottom-4 left-4">
                <StarRating rating={localRating} setRating={setLocalRating} size={28} />
              </div>

              {/* Submit button - bottom right */}
              <div className="absolute bottom-4 right-4">
                <PrimaryButton
                  disabled={processing}
                  className="px-3 py-1.5 text-sm bg-amber-300"
                >
                  {review ? "Update" : "Submit"}
                </PrimaryButton>
              </div>
            </div>

            {/* Image gallery */}
            <div className="flex flex-wrap gap-3 items-center mt-2">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group w-28 h-28 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600"
                >
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 z-10 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs shadow-md hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <FaTrashAlt className="text-sm" />
                  </button>
                </div>
              ))}
              {previewUrls.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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

            {errors.review && <span className="text-red-500">{errors.review}</span>}
          </form>
        )}
      </div>
    );
  }
