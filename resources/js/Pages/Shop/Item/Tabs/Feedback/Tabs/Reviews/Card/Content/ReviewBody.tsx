import React from "react";
import ImageGallery from "./ImageGallery/ImageGallery";
import StarRating from "../../Form/StarRating";
import InputLabel from "@/Components/Login/InputLabel";
import { Review, useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface Props {
  review: Review;
}

export default function ReviewBody({ review }: Props) {
  const {
    isEditingId,
    cancelEdit,
    editedTextById,
    setEditedTextById,
    editedRatingById,
    setEditedRatingById,
    editedImagesById,
    setEditedImagesById,
  } = useReviews();

  const id = review.id?.toString() || "";
  const isEditing = isEditingId === id;

  const content = editedTextById[review.id!] ?? review.content;
  const rating = editedRatingById[review.id!] ?? review.rating ?? 0;
  const images = editedImagesById[review.id!] ?? review.images ?? [];

  return (
    <div className="space-y-2">
      {isEditing ? (
        <>
          <InputLabel
            htmlFor="review"
            value={review.parent_id === null ? "Your Review" : "Your Reply"}
          />
          <div className="relative text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
            <textarea
              id="review"
              value={content}
              onChange={(e) => setEditedTextById(review.id!, e.target.value)}
              placeholder="Write your review here..."
              rows={5}
              className="resize-none w-full bg-white dark:bg-[#1e2124] text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
              maxLength={300}
            />
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                {content.length} / 300
              </div>
              {review.parent_id === null && (
                <StarRating
                  rating={rating}
                  setRating={(r) => setEditedRatingById(review.id!, r)}
                />
              )}
            </div>
          </div>

          {(images.length > 0 || isEditing) && (
            <ImageGallery
              initialImages={images}
              isEditing={true}
              maxImages={5}
              onImagesChange={(newImages) =>
                setEditedImagesById(review.id!, newImages)
              }
            />
          )}
        </>
      ) : (
        <>
          <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 break-words">
            {review.content}
          </div>
          {review.images && review.images.length > 0 && (
            <ImageGallery
              initialImages={review.images}
              isEditing={false}
              maxImages={5}
            />
          )}
        </>
      )}
    </div>
  );
}
