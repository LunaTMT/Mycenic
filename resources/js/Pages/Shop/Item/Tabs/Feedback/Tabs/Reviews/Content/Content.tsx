import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useReviews } from "@/Contexts/Shop/Items/ReviewsContext";
import ReviewHeader from "./ReviewHeader";
import ReviewBody from "./ReviewBody";
import ReviewFooter from "./ReviewFooter";
import ReviewEditControls from "./ReviewEditControls";
import ZoomModal from "./ZoomModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

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
    deleteReview,
    isEditingId,
    setIsEditingId,
    cancelEdit,
    confirmingDeleteId,
    setConfirmingDeleteId,
    closeDeleteModal,
    deleting,
    setDeleting,
  } = useReviews();

  const page = usePage();
  const authUser = page.props.auth?.user;

  const id = review.id?.toString() || "";
  const showReplyForm = openReplyFormId === id;
  const expanded = expandedIds.has(id);
  const repliesCount = review.replies_recursive?.length || 0;

  const isEditing = isEditingId === id;
  const confirmingDelete = confirmingDeleteId === id;

  const toggleReplyForm = () => setOpenReplyFormId(showReplyForm ? null : id);
  const toggleExpanded = () => toggleExpandedId(id);

  const [editedText, setEditedText] = useState(review.content);
  const [editedRating, setEditedRating] = useState(review.rating || 0);
  const [editedImage, setEditedImage] = useState<File | null>(null);

  useEffect(() => {
    if (isEditing) {
      setEditedText(review.content);
      setEditedRating(review.rating || 0);
      setEditedImage(null);
    }
  }, [isEditing, review.content, review.rating]);

  const createdAt = new Date(review.created_at);
  const now = new Date();
  const minutesSinceCreated = (now.getTime() - createdAt.getTime()) / 60000;
  const canEdit = minutesSinceCreated <= 10;

  const isOwner = review.user?.id === authUser?.id;
  const isAdmin = authUser?.is_admin || authUser?.isAdmin;

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const openZoom = (url: string) => setZoomedImage(url);
  const closeZoom = () => setZoomedImage(null);

  const handleSave = () => {
    updateReview(review.id!, editedText, editedRating, editedImage).then((success) => {
      if (success) setIsEditingId(null);
    });
  };

  const handleDelete = () => {
    setDeleting(true);
    deleteReview(review.id!).then((success) => {
      if (success) setConfirmingDeleteId(null);
      setDeleting(false);
    });
  };

  return (
    <>
      <div className="relative min-h-[100px] flex flex-col flex-1 justify-between">
        <div className="flex flex-col flex-grow basis-4/5">
          <ReviewHeader
            name={review.user?.name}
            isAdmin={!!review.isAdmin}
            createdAt={createdAt}
            rating={review.rating}
            isEditing={isEditing}
            isTopLevel={!review.parent_id}
          />

          <ReviewBody
            isEditing={isEditing}
            content={review.content}
            editedText={editedText}
            onTextChange={setEditedText}
            editedRating={editedRating}
            onRatingChange={setEditedRating}
            editedImage={editedImage}
            onImageChange={setEditedImage}
            images={review.images}
            onImageClick={openZoom}
          />
        </div>

        <ReviewFooter
          repliesCount={repliesCount}
          expanded={expanded}
          showReplyForm={showReplyForm}
          onToggleReplyForm={toggleReplyForm}
          onToggleExpanded={toggleExpanded}
          isOwner={isOwner}
          canEdit={canEdit}
          isAdmin={!!isAdmin}
          reviewId={review.id!}
          likes={review.likes || 0}
          dislikes={review.dislikes || 0}
          isEditing={isEditing} // important so buttons hide when editing
        />

        {isEditing && (
          <ReviewEditControls
            onSave={handleSave}
            onCancel={cancelEdit}
          />
        )}
      </div>

      {zoomedImage && <ZoomModal imageUrl={zoomedImage} onClose={closeZoom} />}

      <DeleteConfirmationModal
        show={confirmingDelete}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </>
  );
}
