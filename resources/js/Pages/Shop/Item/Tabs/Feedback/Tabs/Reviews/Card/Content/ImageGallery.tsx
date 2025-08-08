import React, { useRef } from "react";
import { FaTrashAlt, FaPlus } from "react-icons/fa";

import DeleteConfirmationModal from "../../../Components/ImageGallery/DeleteConfirmationModal";
import ZoomModal from "../../../Components/ImageGallery/ZoomModal";
import { resolveImageSrc } from "@/utils/resolveImageSrc";
import { Image, LocalImage } from "@/types/Image";

interface ImageGalleryProps {
  images: (Image | LocalImage)[];
  setImages: React.Dispatch<React.SetStateAction<(Image | LocalImage)[]>>;
  deletedImageIds: number[];
  setDeletedImageIds: React.Dispatch<React.SetStateAction<number[]>>;
  isEditing: boolean;
}

const maxImages = 5;

export default function ImageGallery({
  images,
  setImages,
  deletedImageIds,
  setDeletedImageIds,
  isEditing,
}: ImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Zoom and delete confirm states (local to this component)
  const [zoomedImage, setZoomedImage] = React.useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const [deletingImage, setDeletingImage] = React.useState(false);
  const [imageToDelete, setImageToDelete] = React.useState<number | null>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remaining = maxImages - images.length;
    if (files.length > remaining) alert(`You can only add ${remaining} more image(s).`);

    const newImages: LocalImage[] = files.slice(0, remaining).map((file) => ({
      id: Date.now() + Math.random(),
      imageable_id: 0,
      imageable_type: "",
      path: URL.createObjectURL(file),
      created_at: "",
      updated_at: "",
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const deleteImage = (id: number) => {
    const imgToDelete = images.find((img) => img.id === id);
    if (imgToDelete && !("file" in imgToDelete)) {
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

  return (
    <>
      <div className="flex flex-wrap gap-2 relative">
        {images.map((img) => {
          const src = resolveImageSrc(img.path);
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

      {zoomedImage && <ZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />}
    </>
  );
}
