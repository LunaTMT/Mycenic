import React, { useEffect, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import { useReviews, Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import ReviewImageGallery from "./ImageGallery/ReviewImageGallery";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import LikeDislikeButtons from "../../../Components/LikeDislikeButtons";
import ActionsDropdown from "./ActionDropdown";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";
import { FaUserShield } from "react-icons/fa";
import StaticStarRating from "./StaticStarRating";
import InputLabel from "@/Components/Login/InputLabel";
import StarRating from "../../Form/StarRating";

interface ReviewContentProps {
  review: Review;
}

export default function ReviewContent({ review }: ReviewContentProps) {
  const {
    openReplyFormId,
    setOpenReplyFormId,
    expandedIds,
    toggleExpandedId,
    updateReview,
    isEditingId,
    setIsEditingId,
    cancelEdit,
    confirmingDeleteId,
    errors,
    MAX_LENGTH,

    getEditedTextById,
    setEditedTextById,
    getEditedRatingById,
    setEditedRatingById,

    imagesByReviewId,
    addImage,
    removeImage,
    deletedImageIdsByReviewId,
  } = useReviews();

  const { auth } = usePage().props;
  const authUser = auth?.user;

  const id = review.id?.toString() || "";
  const isEditing = isEditingId === id;
  const confirmingDelete = confirmingDeleteId === id;
  const showReplyForm = openReplyFormId === id;
  const expanded = expandedIds.has(id);
  const repliesCount = review.replies_recursive?.length || 0;

  const createdAt = new Date(review.created_at);
  const canEdit = (Date.now() - createdAt.getTime()) / 60000 <= 10;
  const isOwner = review.user?.id === authUser?.id;
  const isAdmin = authUser?.is_admin || authUser?.isAdmin;

  // Images and deleted images from context:
  const images = imagesByReviewId[review.id!] || [];
  const imagesToDelete = deletedImageIdsByReviewId[review.id!] || [];

  // Local state for content and rating during editing
  const [localContent, setLocalContent] = useState<string>(review.content ?? "");
  const [localRating, setLocalRating] = useState<number>(review.rating ?? 0);

  const [saving, setSaving] = useState(false);

  // Initialize local content & rating only once when entering edit mode:
  useEffect(() => {
  if (isEditing) {
    setLocalContent(review.content ?? "");
    setLocalRating(review.rating ?? 0);
  }
}, [isEditing, review]);

  const handleSave = async () => {
    if (!review.id) return;

    // Update context with local changes only on Save
    setEditedTextById(review.id!, localContent);
    setEditedRatingById(review.id!, localRating);

    setSaving(true);
    const newFiles = images.filter((img) => img.id < 0 && img.file).map((img) => img.file!) ?? [];

    const success = await updateReview(review.id, localContent, localRating, newFiles, imagesToDelete);

    if (success) {
      setIsEditingId(null);
    } else {
      console.error("Failed to update review");
    }
    setSaving(false);
  };

  const ReviewHeader = () => (
    <div className="flex flex-col gap-0.5 mb-2">
      <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
        {review.user?.name ?? "Unknown"}
        {review.isAdmin && (
          <FaUserShield
            className="text-yellow-500 dark:text-[#7289da]"
            title="Admin"
          />
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {createdAt.toLocaleDateString()}
        {!review.parent_id && review.rating && (
          <div className="ml-2">
            <StaticStarRating rating={review.rating} size={14} />
          </div>
        )}
      </div>
    </div>
  );

  const ReviewBody = () => (
    <>
      {isEditing ? (
        <>
          <div>
            <InputLabel htmlFor="review" value="Your Review" />

            <div className="relative mt-1 w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
              <textarea
                id="review"
                value={localContent}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_LENGTH) {
                    setLocalContent(e.target.value);
                  }
                }}
                placeholder="Write your review here..."
                rows={5}
                className="
                  resize-none w-full
                  bg-white dark:bg-[#1e2124]
                  text-gray-900 dark:text-gray-100
                  px-4 pt-3 pb-12
                  rounded-md
                  border-none
                  focus:outline-none focus:ring-0
                  min-h-[120px]
                "
              />

              <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                  {localContent.length} / {MAX_LENGTH}
                </div>

                <StarRating
                  rating={localRating}
                  setRating={(value) => {
                    setLocalRating(value);
                  }}
                />
              </div>
            </div>

            {errors.review && <span className="text-red-500">{errors.review}</span>}
          </div>

          <ReviewImageGallery
            images={images}
            addImage={(file) => addImage(review.id!, file)}
            removeImage={(imageId) => removeImage(review.id!, imageId)}
            isEditing={isEditing}
          />
        </>
      ) : (
        <>
          <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 break-words">
            {review.content}
          </div>
          <ReviewImageGallery images={images} isEditing={false} />
        </>
      )}
    </>
  );

  const ReviewFooter = () => {
    if (isEditing) {
      return (
        <div className="flex gap-2 mt-2">
          <PrimaryButton
            onClick={handleSave}
            disabled={saving}
            className="text-[13px] font-semibold px-3 py-1"
          >
            {saving ? "Saving..." : "Save"}
          </PrimaryButton>
          <SecondaryButton
            onClick={() => {
              cancelEdit();
              setIsEditingId(null);
              setLocalContent(review.content ?? "");
              setLocalRating(review.rating ?? 0);
              setEditedTextById(review.id!, review.content ?? "");
              setEditedRatingById(review.id!, review.rating ?? 0);
            }}
            className="text-[13px] font-semibold px-3 py-1"
            disabled={saving}
          >
            Cancel
          </SecondaryButton>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mt-4 w-full">
          <div className="flex gap-2">
            {authUser && (
              <PrimaryButton
                onClick={() => setOpenReplyFormId(showReplyForm ? null : id)}
                className="text-[13px] font-semibold px-3 py-1"
              >
                {showReplyForm ? "Cancel" : "Reply"}
              </PrimaryButton>
            )}
            {repliesCount > 0 && (
              <SecondaryButton
                onClick={() => toggleExpandedId(id)}
                className="text-[13px] font-semibold px-3 py-1"
              >
                {expanded ? "Hide Replies" : `Show (${repliesCount})`}
              </SecondaryButton>
            )}
          </div>

          <div className="flex items-center gap-2">
            <LikeDislikeButtons
              initialLikes={review.likes || 0}
              initialDislikes={review.dislikes || 0}
            />
            {authUser && (
              <ActionsDropdown
                reviewId={review.id!}
                isOwner={isOwner}
                canEdit={canEdit}
                isAdmin={!!isAdmin}
              />
            )}
          </div>
        </div>

        {!authUser && showReplyForm && (
          <div className="mt-4 w-full">
            <AuthNotice />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="relative min-h-[100px] flex flex-col flex-1 justify-between">
      <div className="flex flex-col flex-grow basis-4/5">
        <ReviewHeader />
        <ReviewBody />
      </div>
      <ReviewFooter />
    </div>
  );
}
