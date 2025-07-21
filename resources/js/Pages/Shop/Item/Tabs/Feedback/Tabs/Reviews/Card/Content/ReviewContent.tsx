import React, { useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useReviews, Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import LikeDislikeButtons from "../../../Components/LikeDislikeButtons";
import ActionsDropdown from "./ActionDropdown";
import StaticStarRating from "./StaticStarRating";
import ReviewBody from "./ReviewBody";
import ImageGallery from "./ImageGallery/ImageGallery";
import ReplyForm from "../../../Components/ReplyForm";
import { FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";

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
    deletedImageIdsByReviewId,
    addImage,
    removeImage,
    markImageForDeletion,
    addReply,
    clearImagesForReview,
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

  const images = imagesByReviewId[review.id!] || [];
  const imagesToDelete = deletedImageIdsByReviewId[review.id!] || [];

  const backendImages = (review.images ?? []).filter(img => !imagesToDelete.includes(img.id));
  const newUploadedImages = images.filter(img => img.id < 0 && img.file);
  const displayImages = isEditing
    ? [...backendImages, ...newUploadedImages]
    : backendImages;

  const [localContent, setLocalContent] = useState<string>(review.content ?? "");
  const [localRating, setLocalRating] = useState<number>(review.rating ?? 0);
  const [saving, setSaving] = useState(false);

  const prevIsEditingRef = useRef(false);

  useEffect(() => {
    if (isEditing && !prevIsEditingRef.current) {
      setLocalContent(review.content ?? "");
      setLocalRating(review.rating ?? 0);
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing]);

  const saveContent = async () => {
    if (!review.id) return;

    setSaving(true);
    setEditedTextById(review.id, localContent);
    setEditedRatingById(review.id, localRating);

    const newFiles = images.filter((img) => img.id < 0 && img.file).map((img) => img.file!) ?? [];

    const result = await updateReview(
      review.id,
      localContent,
      localRating,
      newFiles,
      imagesToDelete
    );

    if (!result.success) {
      toast.error(`Failed to update review: ${result.message}`);
    } else {
      clearImagesForReview(review.id);
    }

    setSaving(false);
  };

  const handleSave = async () => {
    await saveContent();
    setIsEditingId(null);
  };

  const handleReply = (text: string) => {
    if (!authUser) return;
    addReply(id, text);
    setOpenReplyFormId(null);
  };

  const ReviewHeader = () => (
    <div className="flex flex-col gap-0.5">
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
        {new Date(review.created_at).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
        {!review.parent_id && review.rating && (
          <div className="ml-2">
            <StaticStarRating rating={review.rating} size={14} />
          </div>
        )}
      </div>
    </div>
  );

  const ReviewFooter = () => (
    <div className="space-y-3">
      {(displayImages.length > 0 || isEditing) && (
        <ImageGallery
          images={displayImages}
          isEditing={isEditing}
          addImage={(file) => addImage(review.id!, file)}
          removeImage={(imageId) => removeImage(review.id!, imageId)}
          markImageForDeletion={(imageId) => markImageForDeletion(review.id!, imageId)}
          maxImages={5}
        />
      )}

      <div>
        {isEditing ? (
          <div className="flex gap-2">
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
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              <PrimaryButton
                onClick={() => setOpenReplyFormId(showReplyForm ? null : id)}
                className="text-[13px] font-semibold px-3 py-1"
              >
                {showReplyForm ? "Cancel" : "Reply"}
              </PrimaryButton>
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
                reviewId={review.id!}
                initialLikes={review.likes || 0}
                initialDislikes={review.dislikes || 0}
              />
              {authUser && (
                <ActionsDropdown
                  reviewId={review.id!}
                  isOwner={isOwner}
                  canEdit={canEdit}
                  isAdmin={isAdmin}
                  review={review}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-2">
          <ReplyForm
            onSubmit={handleReply}
            onCancel={() => setOpenReplyFormId(null)}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-[100px] flex flex-col flex-1 justify-between">
      <div className="space-y-2">
        <ReviewHeader />
        <ReviewBody
          isEditing={isEditing}
          localContent={localContent}
          setLocalContent={setLocalContent}
          saveContent={saveContent}
          localRating={localRating}
          setLocalRating={setLocalRating}
          errors={errors}
          MAX_LENGTH={MAX_LENGTH}
          reviewContent={review.content}
          review={review}
        />

      </div>
      <div className="mt-4">
        <ReviewFooter />
      </div>
    </div>
  );
}
