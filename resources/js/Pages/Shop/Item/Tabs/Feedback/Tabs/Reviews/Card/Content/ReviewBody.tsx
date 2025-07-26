import React, { useState, useMemo } from "react";
import ImageGallery from "../../../Components/ImageGallery/ImageGallery";
import StarRating from "../../Form/StarRating";
import InputLabel from "@/Components/Login/InputLabel";

export interface Review {
  id: number;
  parent_id: number | null;
  content: string;
  rating?: number;
  images?: string[];
}

interface Props {
  review: Review;
}

export default function ReviewBody({ review }: Props) {
  const id = review.id.toString();
  const isTopLevel = review.parent_id === null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(review.content);
  const [editedRating, setEditedRating] = useState(review.rating ?? 0);
  const [editedImages, setEditedImages] = useState<string[]>(review.images ?? []);

  const handleToggleEdit = () => setIsEditing(!isEditing);

  return (
    <div className="space-y-2">
      {isEditing ? (
        <>
          <InputLabel
            htmlFor="review"
            value={isTopLevel ? "Your Review" : "Your Reply"}
          />
          <div className="relative text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
            <textarea
              id="review"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="Write your review here..."
              rows={5}
              className="resize-none w-full bg-white dark:bg-[#1e2124] text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
              maxLength={300}
            />
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                {editedText.length} / 300
              </div>
              {isTopLevel && (
                <StarRating
                  rating={editedRating}
                  setRating={setEditedRating}
                />
              )}
            </div>
          </div>

          {(editedImages.length > 0 || isEditing) && (
            <ImageGallery
              initialImages={editedImages}
              isEditing={true}
              maxImages={5}
              onImagesChange={setEditedImages}
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
