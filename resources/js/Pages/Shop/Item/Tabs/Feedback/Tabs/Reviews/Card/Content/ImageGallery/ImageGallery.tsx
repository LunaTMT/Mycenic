import React, { useRef, useState, useEffect } from "react";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import ZoomModal from "./ZoomModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Image {
  id: number;
  image_path?: string;
  file?: File;
}

interface ImageGalleryProps {
  initialImages?: Image[]; // make optional, default to []
  isEditing: boolean;
  maxImages?: number;
}

export default function ImageGallery({
  initialImages = [],
  isEditing,
  maxImages = 5,
}: ImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Manage images locally, default to empty array if undefined
  const [images, setImages] = useState<Image[]>(initialImages);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [confirmingImageDelete, setConfirmingImageDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  // Cleanup object URLs when images change or component unmounts
  useEffect(() => {
    const objectUrls = images
      .filter(img => img.file)
      .map(img => URL.createObjectURL(img.file!));

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [images]);

  const getImageUrl = (img: Image) =>
    img.file
      ? URL.createObjectURL(img.file)
      : img.image_path?.startsWith("http")
      ? img.image_path
      : `/storage/${img.image_path}`;

  const handleAddImage = (file: File) => {
    setImages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(), // unique id for demo
        file,
      },
    ]);
  };

  const handleRemoveImage = (id: number) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="flex flex-wrap gap-2 relative">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative w-30 h-30 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 transform transition-transform duration-300 hover:scale-105"
        >
          <img
            src={getImageUrl(img)}
            alt="Gallery image"
            className="w-full h-full object-cover cursor-pointer z-0"
            onClick={() => setZoomedImage(getImageUrl(img))}
          />
          {isEditing && (
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

      {isEditing && images.length < maxImages && (
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
              const remainingSlots = maxImages - images.length;
              if (files.length > remainingSlots) {
                alert(`You can only add ${remainingSlots} more image(s).`);
              }
              files.slice(0, remainingSlots).forEach(handleAddImage);
              e.target.value = "";
            }}
            className="hidden"
            multiple
          />
        </button>
      )}

      {zoomedImage && (
        <ZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}

      <DeleteConfirmationModal
        show={confirmingImageDelete}
        onClose={() => {
          setConfirmingImageDelete(false);
          setImageToDelete(null);
        }}
        item={"image"}
        onConfirm={async () => {
          if (imageToDelete === null) return;
          setDeleting(true);
          try {
            handleRemoveImage(imageToDelete);
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
    </div>
  );
}
