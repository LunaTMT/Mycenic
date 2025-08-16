import React, { useState, useRef } from "react";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ZoomModal from "./ZoomModal";
import { resolveImageSrc } from "@/utils/resolveImageSrc";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { Review } from "@/types/Review";

interface ImageGalleryProps {
  review: Review;
}

export default function ImageGallery({ review }: ImageGalleryProps) {
  const { onAddImages, onDeleteImage, reviewEditStates } = useReviews();
  const isEditing = reviewEditStates[review.id]?.isEditing || false;
  const images = reviewEditStates[review.id]?.images || review.images || [];

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const currentCount = images.length;
    const remainingSlots = maxImages - currentCount;

    if (remainingSlots <= 0) {
      alert(`You can only upload up to ${maxImages} images.`);
      e.target.value = "";
      return;
    }

    const filesToAdd = Array.from(e.target.files).slice(0, remainingSlots);
    onAddImages(review.id, filesToAdd as unknown as FileList); // cast because your onAddImages expects FileList
    e.target.value = "";
  }


  async function confirmDeleteImage() {
    if (imageToDelete === null) return;
    setDeletingImage(true);
    try {
      await onDeleteImage(review.id, imageToDelete);
      setConfirmingDelete(false);
      setImageToDelete(null);
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setDeletingImage(false);
    }
  }

  const maxImages = 5;

  return (
    <>
      <div className="flex flex-wrap gap-2 relative">
        {images.map((img) => {
          const src = resolveImageSrc(img);
          return (
            <div
              key={img.id ?? src}
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
                      setImageToDelete(img.id ?? null);
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
        onClose={() => {
          setConfirmingDelete(false);
          setImageToDelete(null);
        }}
        onConfirm={confirmDeleteImage}
        deleting={deletingImage}
        item="image"
        message="Once deleted, this image will be permanently removed."
      />

      {zoomedImage && (
        <ZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </>
  );
}
