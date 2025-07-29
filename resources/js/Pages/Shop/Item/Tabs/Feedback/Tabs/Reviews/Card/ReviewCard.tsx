import React, { useState, useEffect, useRef } from "react";
import { usePage, router } from "@inertiajs/react";
import { toast } from "react-toastify";

import Avatar from "./Content/Avatar";
import { Review } from "@/types/types";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

import StaticStarRating from "@/Components/Stars/StaticStarRating";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import InputLabel from "@/Components/Login/InputLabel";
import StarRating from "../Form/StarRating";

import { FaUserShield, FaTrashAlt, FaPlus } from "react-icons/fa";
import ArrowButton from "@/Components/Icon/ArrowIcon";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";
import Dropdown from "@/Components/Dropdown/Dropdown";
import { BsThreeDots } from "react-icons/bs";
import DeleteConfirmationModal from "../../Components/ImageGallery/DeleteConfirmationModal";
import LikeDislikeButtons from "../../Components/LikeDislikeButtons";

import { resolveSrc } from "@/utils/resolveSrc";

interface ReviewCardProps {
  review: Review;
  depth?: number;
}

const MAX_LENGTH = 300;

export default function ReviewCard({ review, depth = 0 }: ReviewCardProps) {
  const {
    expandedIds,
    toggleExpandedId,
    openReplyFormId,
    setOpenReplyFormId,
    addReply,
    fetchReviews,
  } = useReviews();

  const reviewId = review.id;
  const isExpanded = expandedIds.includes(reviewId);

  const { auth } = usePage().props as { auth: { user: any | null } };
  const authUser = auth?.user ?? null;

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(review.content || "");
  const [editedRating, setEditedRating] = useState(Number(review.rating) || 0);

  // Reply states
  const [replyText, setReplyText] = useState("");
  const replies = review.replies ?? [];
  const localRepliesCount = replies.length;

  const showAuthNotice = !authUser && openReplyFormId === reviewId;

  // Delete states for review deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Permissions
  const isOwner = authUser?.id === review.user?.id;
  const isAdmin = authUser?.is_admin || false;
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  // --- Image gallery states ---
  const inputRef = useRef<HTMLInputElement>(null);
  // Track images - existing images have id and image_path; new images have file only
  const [images, setImages] = useState<
    { id: number; image_path?: string; file?: File }[]
  >(() =>
    (review.images ?? []).map((img, i) => ({
      id: img.id ?? i + 1, // Use DB image id if exists, fallback to index + 1
      image_path: img.image_path,
    }))
  );
  // Track IDs of images deleted by user, to send to backend
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);

  // Zoom and delete confirm for images
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const maxImages = 5;

  useEffect(() => {
    setImages(
      (review.images ?? []).map((img, i) => ({
        id: img.id ?? i + 1,
        image_path: img.image_path,
      }))
    );
    setDeletedImageIds([]); // reset on review change
  }, [review.images]);

  // --- Handlers ---

  // Start editing review
  function startEditing() {
    setEditedContent(review.content || "");
    setEditedRating(Number(review.rating) || 0);
    setIsEditing(true);
  }

  // Cancel editing
  function cancelEditing() {
    setIsEditing(false);
    setDeletedImageIds([]);
  }

  // Save edited review, including new and deleted images
  function saveEditedReview() {
    if (!editedContent.trim()) {
      toast.error("Review content cannot be empty.");
      return;
    }
    if (editedRating <= 0) {
      toast.error("Please provide a rating.");
      return;
    }

    const formData = new FormData();
    formData.append("content", editedContent);
    formData.append("rating", editedRating.toString());

    // Append deleted image IDs
    deletedImageIds.forEach((id) => {
      formData.append("deleted_image_ids[]", id.toString());
    });

    // Append new images
    images.forEach((img) => {
      if (img.file) {
        formData.append("images[]", img.file);
      }
    });

    // Add _method = PUT for Laravel to recognize the request as PUT
    formData.append("_method", "PUT");

    router.post(`/reviews/${reviewId}`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        fetchReviews();
        toast.success("Review updated successfully.");
        setIsEditing(false);
        setDeletedImageIds([]);
      },
      onError: () => {
        toast.error("Failed to update review.");
      },
    });

  }

  // Reply form handlers
  function handleReplyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (e.target.value.length <= MAX_LENGTH) {
      setReplyText(e.target.value);
    }
  }

  function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!replyText.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    if (!authUser) {
      toast.error("You must be logged in to reply.");
      return;
    }

    addReply(reviewId, replyText.trim());
    setReplyText("");
    setOpenReplyFormId(null);
  }

  function handleCancelReply() {
    setOpenReplyFormId(null);
    setReplyText("");
  }

  function handleToggleExpand() {
    toggleExpandedId(reviewId);
  }

  function handleReplyButtonClick() {
    if (authUser) {
      setOpenReplyFormId(openReplyFormId === reviewId ? null : reviewId);
    } else {
      setOpenReplyFormId(reviewId);
    }
  }

  function handleEdit() {
    startEditing();
  }

  function handleDelete() {
    setDeleteConfirmId(reviewId);
  }

  function closeDeleteConfirm() {
    setDeleteConfirmId(null);
  }

  function confirmDelete(id: number) {
    setDeleting(true);
    // TODO: perform delete API call or context update here
    setDeleting(false);
    setDeleteConfirmId(null);
  }

  // Image Gallery handlers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remaining = maxImages - images.length;
    if (files.length > remaining)
      alert(`You can only add ${remaining} more image(s).`);

    const newImages = files.slice(0, remaining).map((file) => ({
      id: Date.now() + Math.random(),
      file,
    }));
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  // Mark image for deletion and remove from display
  const deleteImage = (id: number) => {
    const imgToDelete = images.find((img) => img.id === id);
    if (imgToDelete && imgToDelete.image_path) {
      setDeletedImageIds((prev) => [...prev, id]);
    }
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const confirmDeleteImage = () => {
    if (imageToDelete === null) return;
    setDeletingImage(true);
    deleteImage(imageToDelete);
    setDeletingImage(false);
    setImageToDelete(null);
    setConfirmingDelete(false);
  };

  function getImageSrc(img: { image_path?: string; file?: File }) {
    if (img.file) {
      // For newly uploaded images (File objects), create an object URL
      return URL.createObjectURL(img.file);
    }

    if (!img.image_path) return "";

    // Check if image_path starts with http(s), assume external URL
    if (img.image_path.startsWith("http://") || img.image_path.startsWith("https://")) {
      return img.image_path; // full Unsplash URL
    }

    // Otherwise, assume local storage path, prefix with /storage/
    return `/storage/${img.image_path}`;
  }

  // --- Render helpers ---

  function renderHeader() {
    return (
      <div className="relative flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
            {review.user?.name ?? "Unknown User"}
            {review.user?.isAdmin && (
              <FaUserShield
                className="text-yellow-500 dark:text-[#7289da]"
                title="Admin"
              />
            )}
          </div>
          <ArrowButton
            isOpen={isExpanded}
            onClick={handleToggleExpand}
            w="24"
            h="24"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {review.created_at ? (
            new Date(review.created_at).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          ) : (
            "Unknown date"
          )}
          {review.parent_id === null && (
            <div className="ml-2">
              <StaticStarRating rating={Number(review.rating)} size={14} />
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderReviewContent() {
    if (isEditing) {
      return (
        <>
          <InputLabel
            htmlFor="review"
            value={depth === 0 ? "Your Review" : "Your Reply"}
          />
          <div className="relative text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] shadow-sm flex flex-col">
            <textarea
              id="review"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Write your review here..."
              rows={5}
              maxLength={MAX_LENGTH}
              className="resize-none w-full bg-white dark:bg-[#1e2124] text-gray-900 dark:text-gray-100 px-4 pt-3 pb-12 rounded-md border-none focus:outline-none focus:ring-0 min-h-[120px]"
            />
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
                {editedContent.length} / {MAX_LENGTH}
              </div>
              {depth === 0 && (
                <StarRating rating={editedRating} setRating={setEditedRating} />
              )}
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 break-words">
        {review.content}
      </div>
    );
  }

  // --- Inline ImageGallery component ---
  function ImageGallery() {
    return (
      <>
        <div className="flex flex-wrap gap-2 relative">
          {images.map((img) => {
            const src = getImageSrc(img);
            return (
              <div
                key={img.id}
                className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={src}
                  alt="Gallery image"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setZoomedImage(src)}
                />
                {isEditing && (
                  <>
                    <div className="absolute inset-0 bg-black/30 opacity-20 hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageToDelete(img.id);
                        setConfirmingDelete(true);
                      }}
                      className="absolute top-1 right-1 z-10 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs shadow-md hover:scale-110 transition-transform"
                      title="Remove image"
                    >
                      <FaTrashAlt className="text-sm" />
                    </button>
                  </>
                )}
              </div>
            );
          })}

          {isEditing && images.length < maxImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-20 h-20 flex items-center justify-center border border-dashed border-gray-400 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <FaPlus />
              <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={handleFileInputChange}
                className="hidden"
                multiple
              />
            </button>
          )}
        </div>

        <DeleteConfirmationModal
          show={confirmingDelete}
          onClose={() => setConfirmingDelete(false)}
          onConfirm={confirmDeleteImage}
          deleting={deletingImage}
          item="image"
          message="Once deleted, this image will be permanently removed."
        />
      </>
    );
  }

  function renderReplyForm() {
    if (openReplyFormId !== reviewId || !authUser) return null;

    return (
      <form onSubmit={handleReplySubmit} className="space-y-3">
        <div className="relative">
          <InputLabel htmlFor="reply-text" value="Your Reply" />
          <textarea
            id="reply-text"
            name="reply-text"
            rows={5}
            value={replyText}
            onChange={handleReplyChange}
            placeholder="Write your reply here..."
            className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2124] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm resize-none"
          />
          <span className="absolute top-8 right-4 text-xs text-gray-500 dark:text-gray-400 select-none pointer-events-none">
            {replyText.length} / {MAX_LENGTH}
          </span>
        </div>
      </form>
    );
  }

  function renderActionButtons() {
    if (isEditing) {
      return (
        <>
          <PrimaryButton
            onClick={saveEditedReview}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Save
          </PrimaryButton>
          <SecondaryButton
            onClick={cancelEditing}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Cancel
          </SecondaryButton>
        </>
      );
    }

    if (showAuthNotice) {
      return (
        <>
          <PrimaryButton
            onClick={handleReplyButtonClick}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Reply
          </PrimaryButton>
          <SecondaryButton
            onClick={handleCancelReply}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Cancel
          </SecondaryButton>
        </>
      );
    }

    if (openReplyFormId === reviewId && authUser) {
      return (
        <div className="flex gap-2">
          <PrimaryButton
            onClick={handleReplySubmit}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Submit
          </PrimaryButton>
          <SecondaryButton
            onClick={handleCancelReply}
            className="text-[13px] font-semibold px-3 py-1"
          >
            Cancel
          </SecondaryButton>
        </div>
      );
    }

    return (
      <>
        <PrimaryButton
          onClick={handleReplyButtonClick}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Reply
        </PrimaryButton>
        {localRepliesCount > 0 && (
          <SecondaryButton
            onClick={handleToggleExpand}
            className="text-[13px] font-semibold px-3 py-1"
          >
            {isExpanded ? "Hide Replies" : `Show Replies (${localRepliesCount})`}
          </SecondaryButton>
        )}
      </>
    );
  }

  function renderRightActions() {
    return (
      <div className="flex items-center gap-3 ml-auto">
        <LikeDislikeButtons
          reviewId={reviewId}
          initialLikes={review.likes || 0}
          initialDislikes={review.dislikes || 0}
        />

        {auth.user && (
          <Dropdown>
            <Dropdown.Trigger>
              <div className="flex justify-center items-center cursor-pointer p-1 rounded text-gray-700 dark:text-white/70 hover:text-black dark:hover:text-white">
                <BsThreeDots size={20} />
              </div>
            </Dropdown.Trigger>

            <Dropdown.Content
              width="fit"
              contentClasses="bg-white dark:bg-[#424549] shadow-lg z-50"
            >
              <ul className="text-sm font-Poppins text-right w-full">
                {canEdit && (
                  <li
                    onClick={handleEdit}
                    className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70"
                  >
                    Edit
                  </li>
                )}

                {canDelete && (
                  <li
                    onClick={handleDelete}
                    className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70"
                  >
                    Delete
                  </li>
                )}
              </ul>
            </Dropdown.Content>
          </Dropdown>
        )}

        <DeleteConfirmationModal
          show={deleteConfirmId === reviewId}
          onClose={() => closeDeleteConfirm()}
          onConfirm={() => confirmDelete(reviewId)}
          deleting={deleting}
          item="review"
          message="Once deleted, this review and all its replies will be permanently removed."
        />
      </div>
    );
  }

  // --- Main render ---
  return (
    <div
      className={`relative p-4 space-y-4 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60 ${
        depth > 0
          ? "ml-3 pl-4 border-l-4 border-yellow-500 dark:border-[#7289da]"
          : "border border-black/20 dark:border-white/20"
      }`}
      style={{ marginLeft: depth * 12 }}
    >
      <div className="flex space-x-4">
        <Avatar review={review} />

        <div className="flex-1 break-words">
          <div className="min-h-[100px] flex flex-col justify-between space-y-3">
            {renderHeader()}

            <div className="space-y-2">
              {renderReviewContent()}
              {review.images?.length > 0 && <ImageGallery />}
            </div>

            <div className="flex flex-col gap-4 w-full">
              {renderReplyForm()}

              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="flex gap-2 flex-wrap items-center">
                  {renderActionButtons()}
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  {renderRightActions()}
                </div>
              </div>

              {showAuthNotice && <AuthNotice />}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && localRepliesCount > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <ReviewCard key={reply.id} review={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
