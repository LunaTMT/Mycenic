import React, { useState, FormEventHandler, useRef, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import InputLabel from "@/Components/Login/InputLabel";
import Dropdown from "@/Components/Dropdown/Dropdown";
import ArrowIcon from "@/Components/Buttons/ArrowButton";
import { toast } from "react-toastify";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";
import { useReviews } from "@/Contexts/Shop/Items/ReviewsContext";
import axios from "axios";
import { FiUpload } from "react-icons/fi";
import StarRating from "../test/StarRating";
import { useItemContext } from "@/Contexts/Shop/Items/ItemContext";

const categories = [
  { value: "product_quality", label: "Product Quality" },
  { value: "shipping_experience", label: "Shipping Experience" },
  { value: "customer_service", label: "Customer Service" },
];

interface ReviewFormProps {
  onSubmitSuccess?: () => void;
  review?: {
    id: number;
    content: string;
    category: string;
    rating: number;
    images?: { image_path: string }[];
  };
}

export default function ReviewForm({ onSubmitSuccess, review }: ReviewFormProps) {
  const { auth } = usePage().props;
  const authUser = auth?.user;

  const {
    reviewText,
    setReviewText,
    rating,
    setRating,
    errors,
    setErrors,
    processing,
    setProcessing,
    MAX_LENGTH,
    refreshReviews,
    setShowForm,
  } = useReviews();

  const { item } = useItemContext();

  const [category, setCategory] = useState(review?.category || "product_quality");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>(
    review?.images?.map((img) => img.image_path) || []
  );

  const MAX_IMAGES = 5;

  useEffect(() => {
    if (review) {
      setReviewText(review.content);
      setRating(review.rating);
      setCategory(review.category);
    }
  }, [review]);

  useEffect(() => {
    previewUrls.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    const newUrls = images.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...review?.images?.map(i => i.image_path) || [], ...newUrls]);

    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const combinedFiles = [...images, ...selectedFiles].slice(0, MAX_IMAGES);

    if (combinedFiles.length > MAX_IMAGES) {
      toast.error(`You can upload up to ${MAX_IMAGES} images only.`);
    }

    setImages(combinedFiles);
  };

  const handleRemoveImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const selectedCategory =
    categories.find((c) => c.value === category)?.label || "Select Category";

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    const formData = new FormData();
    formData.append("content", reviewText);
    formData.append("category", category);
    formData.append("rating", rating.toString());
    formData.append("item_id", item.id.toString());

    images.forEach((image, idx) => {
      formData.append(`images[${idx}]`, image);
    });

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

      setReviewText("");
      setRating(0);
      setCategory("product_quality");
      setImages([]);
      refreshReviews();

      if (onSubmitSuccess) onSubmitSuccess();
      if (setShowForm) setShowForm(false);
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
          className="space-y-6 p-6 border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-[#1e2124]/30"
        >
          {/* Category dropdown */}
          <div className="w-full">
            <InputLabel htmlFor="review-category" value="Category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" />
            <div className="relative inline-block w-full">
              <Dropdown onOpenChange={setDropdownOpen}>
                <Dropdown.Trigger>
                  <div className="flex justify-between items-center min-w-sm px-4 py-2 bg-white dark:bg-[#1e2124] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm cursor-pointer">
                    <span className="text-gray-900 dark:text-gray-100 truncate block max-w-full" title={selectedCategory}>
                      {selectedCategory}
                    </span>
                    <ArrowIcon w="20" h="20" isOpen={dropdownOpen} />
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

          {/* Review textarea and image/rating controls */}
          <div>
            <InputLabel htmlFor="review" value="Your Review" />
            <div className="relative mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
              <textarea
                id="review"
                value={reviewText}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) {
                    setReviewText(e.target.value);
                  }
                }}
                placeholder="Write your review here..."
                className="resize-none w-full bg-transparent text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
                rows={5}
              />
              <div className="absolute top-2 right-3 text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                {reviewText.length} / {MAX_LENGTH}
              </div>

              <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center space-x-2 inline-flex">
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none flex-shrink-0"
                    aria-label="Upload images"
                  >
                    <FiUpload size={24} />
                  </button>

                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-8 h-8 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 rounded-full text-white text-xs w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <StarRating rating={rating} setRating={setRating} />
              </div>

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
          </div>

          <div className="flex justify-end">
            <PrimaryButton disabled={processing} className="px-6 py-2 text-md">
              {review ? "Update" : "Submit"}
            </PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}
