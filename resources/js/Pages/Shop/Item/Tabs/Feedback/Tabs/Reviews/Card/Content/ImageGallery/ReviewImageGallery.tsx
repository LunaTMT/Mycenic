import React, { useRef, useState } from "react";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import ZoomModal from "./ZoomModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Image {
  id: number;
  image_path: string;
  isNew?: boolean;
  file?: File;
}

interface Props {
  images: Image[];
  addImage?: (file: File) => void;
  removeImage?: (imageId: number) => void;
  isEditing: boolean;
}

export default function ReviewImageGallery({
  images,
  addImage,
  removeImage,
  isEditing,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const remaining = 5 - images.length;

  // Return preview URL for image:
  // If new file -> local preview with URL.createObjectURL
  // Else if backend path -> full URL for storage
  const getImageUrl = (img: Image) => {
    if (img.isNew && img.file) {
      return URL.createObjectURL(img.file);
    }
    // existing backend image
    return img.image_path.startsWith("http")
      ? img.image_path
      : `/storage/${img.image_path}`;
  };

  const openZoom = (img: Image) => {
    const fullUrl = getImageUrl(img);
    console.log("[Zoom] Opening image:", fullUrl);
    setZoomedImage(fullUrl);
  };

  const closeZoom = () => {
    console.log("[Zoom] Closed");
    setZoomedImage(null);
  };

  const openDeleteModal = (imageId: number) => {
    console.log("[Delete] Request to delete image ID:", imageId);
    setImageToDelete(imageId);
    setConfirmingDelete(true);
  };

  const closeDeleteModal = () => {
    console.log("[Delete] Cancelled deletion");
    setConfirmingDelete(false);
    setImageToDelete(null);
  };

  const handleDelete = async () => {
    if (imageToDelete === null || !removeImage) return;
    setDeleting(true);
    console.log("[Delete] Confirming delete for image ID:", imageToDelete);
    try {
      removeImage(imageToDelete);
      closeDeleteModal();
    } catch (err) {
      console.error("[Delete] Failed to delete image", err);
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
      console.log("[Add] Adding image:", file.name);
      addImage(file);
    });

    e.target.value = "";
  };

  return (
    <>
      <div className="mt-6 my-3 flex flex-wrap gap-2 relative">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative group w-30 h-30 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600"
          >
            <img
              src={getImageUrl(img)}
              alt="Review image"
              className="w-full h-full object-cover cursor-pointer z-0"
              onClick={() => openZoom(img)}
            />
            {isEditing && removeImage && (
              <>
                <div className="absolute inset-0 bg-black/30 bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity z-5" />
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
            onClick={() => {
              console.log("[Add] Triggering file input...");
              inputRef.current?.click();
            }}
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
