import React, { useState } from "react";
import ReviewInputArea from "../../Form/ReviewInputArea";
import ReviewImageGallery from "./ImageGallery/ImageGallery";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import axios from "axios";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface ReviewEditProps {
  review: Review;
  onCancel: () => void;
}

export default function ReviewEdit({ review, onCancel }: ReviewEditProps) {
  const { updateReview, setIsEditingId, cancelEdit } = useReviews();

  // Local state inside ReviewEdit
  const [content, setContent] = useState(review.content ?? "");
  const [rating, setRating] = useState(review.rating ?? 0);

  const initialImages = review.images || [];
  const [images, setImages] = useState(initialImages);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  const [saving, setSaving] = useState(false);

  const addImage = (file: File) => {
    const newImage = {
      id: Date.now(), // temporary ID
      file,
      image_path: URL.createObjectURL(file),
      isNew: true,
    };
    setImages((prev) => [...prev, newImage]);
  };

  const removeImage = (imageId: number) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    const imageToDelete = images.find((img) => img.id === imageId);
    if (imageToDelete && !imageToDelete.isNew) {
      setImagesToDelete((prev) => [...prev, imageId]);
    }
  };

  const handleSave = async () => {
    if (!review.id) return;
    try {
      setSaving(true);

      const newFiles = images.filter((img) => img.isNew).map((img) => img.file!);

      const success = await updateReview(review.id, content, rating, newFiles, imagesToDelete);

      if (success) {
        const updatedReview = await axios.get(`/reviews/${review.id}`).then((res) => res.data);
        setContent(updatedReview.content);
        setRating(updatedReview.rating);
        setImages(updatedReview.images);
        setImagesToDelete([]);
        setIsEditingId(null);
      } else {
        console.error("Failed to update review");
      }
    } catch (err) {
      console.error("Error updating review:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    cancelEdit();
    setIsEditingId(null);
    setContent(review.content ?? "");
    setRating(review.rating ?? 0);
    setImages(initialImages);
    setImagesToDelete([]);
    onCancel(); // notify parent if needed
  };

  return (
    <div>
      <ReviewInputArea
        review={review}
        content={content}
        setContent={setContent}
        rating={rating}
        setRating={setRating}
      />
      <ReviewImageGallery
        images={images}
        addImage={addImage}
        removeImage={removeImage}
        isEditing={true}
      />
      <div className="flex gap-2 mt-2">
        <PrimaryButton
          onClick={handleSave}
          disabled={saving}
          className="text-[13px] bg-amber-400 font-semibold px-3 py-1"
        >
          {saving ? "Saving..." : "Save"}
        </PrimaryButton>
        <SecondaryButton
          onClick={handleCancel}
          disabled={saving}
          className="text-[13px] font-semibold px-3 py-1"
        >
          Cancel
        </SecondaryButton>
      </div>
    </div>
  );
}
