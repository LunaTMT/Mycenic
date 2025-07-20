import React, { useEffect, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useReviews, Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import LikeDislikeButtons from "../../../Components/LikeDislikeButtons";
import ActionsDropdown from "./ActionDropdown";
import StaticStarRating from "./StaticStarRating";
import InputLabel from "@/Components/Login/InputLabel";
import StarRating from "../../Form/StarRating";
import ReplyForm from "../../../Components/ReplyForm";
import ZoomModal from "./ImageGallery/ZoomModal";
import DeleteConfirmationModal from "./ImageGallery/DeleteConfirmationModal";
import { FaUserShield, FaTrashAlt, FaPlus } from "react-icons/fa";

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

  const displayImages = isEditing
    ? images
    : (review.images ?? []).filter(img => !imagesToDelete.includes(img.id));

  const [localContent, setLocalContent] = useState<string>(review.content ?? "");
  const [localRating, setLocalRating] = useState<number>(review.rating ?? 0);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [confirmingImageDelete, setConfirmingImageDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const prevIsEditingRef = useRef(false);

  useEffect(() => {
    if (isEditing && !prevIsEditingRef.current) {
      setLocalContent(review.content ?? "");
      setLocalRating(review.rating ?? 0);
      // clearImagesForReview(review.id!);
    }
    prevIsEditingRef.current = isEditing;
  }, [isEditing, review.content, review.rating]);

  useEffect(() => {
    const objectUrls: string[] = [];

    images.forEach((img) => {
      if (img.file) {
        const url = URL.createObjectURL(img.file);
        objectUrls.push(url);
      }
    });

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Save content on blur WITHOUT closing editing
  const saveContent = async () => {
    if (!review.id) return;

    setSaving(true);
    setEditedTextById(review.id!, localContent);
    setEditedRatingById(review.id!, localRating);

    const newFiles = images.filter((img) => img.id < 0 && img.file).map((img) => img.file!) ?? [];

    const success = await updateReview(review.id, localContent, localRating, newFiles, imagesToDelete);

    if (!success) {
      console.error("Failed to update review");
    }

    setSaving(false);
  };

  // Save and close editing mode
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
        {createdAt.toLocaleString(undefined, {
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

  const ReviewBody = () => (
    <div className="space-y-2">
      {isEditing ? (
        <>
          <InputLabel htmlFor="review" value="Your Review" />
          <div className="relative text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
            <textarea
              id="review"
              value={localContent}
              onChange={(e) => {
                if (e.target.value.length <= MAX_LENGTH) {
                  setLocalContent(e.target.value);
                }
              }}
              onBlur={saveContent} // save on blur but keep editing open
              placeholder="Write your review here..."
              rows={5}
              className="resize-none w-full bg-white dark:bg-[#1e2124] text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
            />
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                {localContent.length} / {MAX_LENGTH}
              </div>
              <StarRating
                rating={localRating}
                setRating={(value) => setLocalRating(value)}
              />
            </div>
          </div>
          {errors.review && <span className="text-red-500">{errors.review}</span>}
        </>
      ) : (
        <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 break-words">
          {review.content}
        </div>
      )}
    </div>
  );

  const ReviewFooter = () => {
    const getImageUrl = (img: typeof displayImages[0]) =>
      "file" in img && img.file
        ? URL.createObjectURL(img.file)
        : img.image_path.startsWith("http")
        ? img.image_path
        : `/storage/${img.image_path}`;

    return (
      <div className="space-y-3">
        {(displayImages.length > 0 || isEditing) && (
          <>
            <div className="flex flex-wrap gap-2 relative">
              {displayImages.map((img) => (
                <div
                  key={img.id}
                  className="relative w-30 h-30 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 transform transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src={getImageUrl(img)}
                    alt="Review image"
                    className="w-full h-full object-cover cursor-pointer z-0"
                    onClick={() => setZoomedImage(getImageUrl(img))}
                  />
                  {isEditing && removeImage && (
                    <>
                      <div className="absolute inset-0 bg-black/30 opacity-20 hover:opacity-100 transition-opacity z-5" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageToDelete(img.id);
                          setConfirmingImageDelete(true);
                        }}
                        className="absolute top-1 right-1 z-10 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs shadow-md hover:scale-110 transition-transform"
                        title="Remove image"
                      >
                        <FaTrashAlt className="text-sm" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {isEditing && addImage && displayImages.length < 5 && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-30 h-30 flex items-center justify-center border border-dashed border-gray-400 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <FaPlus />
                  <input
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const remainingSlots = 5 - displayImages.length;
                      if (files.length > remainingSlots) {
                        alert(`You can only add ${remainingSlots} more image(s).`);
                      }
                      files.slice(0, remainingSlots).forEach((file) =>
                        addImage(review.id!, file)
                      );
                      e.target.value = "";
                    }}
                    className="hidden"
                    multiple
                  />
                </button>
              )}
            </div>

            {zoomedImage && (
              <ZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
            )}

            <DeleteConfirmationModal
              show={confirmingImageDelete}
              onClose={() => {
                setConfirmingImageDelete(false);
                setImageToDelete(null);
              }}
              onConfirm={async () => {
                if (imageToDelete === null) return;
                setDeleting(true);
                try {
                  removeImage(review.id!, imageToDelete);
                  markImageForDeletion(review.id!, imageToDelete);
                } catch (err) {
                  console.error("Failed to delete image", err);
                } finally {
                  setDeleting(false);
                  setImageToDelete(null);
                  setConfirmingImageDelete(false);
                }
              }}
              deleting={deleting}
            />
          </>
        )}

        <div className="">
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
                    isAdmin={!!isAdmin}
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
  };

  return (
    <div className="relative min-h-[100px] flex flex-col flex-1 justify-between">
      <div className="space-y-2">
        <ReviewHeader />
        <ReviewBody />
      </div>
      <div className="mt-4">
        <ReviewFooter />
      </div>
    </div>
  );
}
