import React, { useRef, useState, useEffect } from "react";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import ZoomModal from "./ZoomModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface Image {
  id: number;
  image_path: string;
  file?: File;
}

interface Props {
  reviewId: number;
  images: Image[];
  isEditing: boolean;
}

export default function ReviewImageGallery({
  reviewId,
  images,
  isEditing,
}: Props) {
  const {
    addImage,
    removeImage,
    markImageForDeletion,
  } = useReviews();

  const inputRef = useRef<HTMLInputElement>(null);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const remaining = 5 - images.length;

  const getImageUrl = (img: Image) => {
    if (img.file) {
      return URL.createObjectURL(img.file);
    }
    return img.image_path.startsWith("http")
      ? img.image_path
      : `/storage/${img.image_path}`;
  };

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

  const openZoom = (img: Image) => {
    const fullUrl = getImageUrl(img);
    setZoomedImage(fullUrl);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };

  const openDeleteModal = (imageId: number) => {
    setImageToDelete(imageId);
    setConfirmingDelete(true);
  };

  const closeDeleteModal = () => {
    setConfirmingDelete(false);
    setImageToDelete(null);
  };

  const handleDelete = async () => {
    if (
      imageToDelete === null
    )
      return;

    setDeleting(true);
    try {
      removeImage(reviewId, imageToDelete);
      markImageForDeletion(reviewId, imageToDelete);
      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete image", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!addImage) return;
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const currentCount = images.length;
    const remainingSlots = 5 - currentCount;

    if (files.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more image(s).`);
    }

    files.slice(0, remainingSlots).forEach((file) => {
      addImage(reviewId, file);
    });

    e.target.value = "";
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 relative">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative w-30 h-30 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 transform transition-transform duration-300 hover:scale-105"
          >
            <img
              src={getImageUrl(img)}
              alt="Review image"
              className="w-full h-full object-cover cursor-pointer z-0"
              onClick={() => openZoom(img)}
            />
            {isEditing && removeImage && (
              <>
                <div className="absolute inset-0 bg-black/30 opacity-20 hover:opacity-100 transition-opacity z-5" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(img.id);
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

        {isEditing && addImage && remaining > 0 && (
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
              onChange={handleAddImage}
              className="hidden"
              multiple
            />
          </button>
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
