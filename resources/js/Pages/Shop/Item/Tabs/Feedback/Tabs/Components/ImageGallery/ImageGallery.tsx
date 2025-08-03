import React, { useRef, useState, useEffect } from "react";
import { FaTrashAlt, FaPlus } from "react-icons/fa";
import ZoomModal from "./ZoomModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { resolveSrc } from "@/utils/resolveImageSrc";

interface Image {
  id: number;
  image_path?: string;
  file?: File;
}

interface ImageGalleryProps {
  isEditing: boolean;
  maxImages?: number;
  initialImages?: string[];

}

export default function ImageGallery({
  isEditing,
  maxImages = 5,
  initialImages = [],
}: ImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Image[]>(() =>
    initialImages.map((img, i) => ({ id: i + 1, image_path: img }))
  );
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  // Update images if initialImages prop changes
  useEffect(() => {
    setImages(initialImages.map((img, i) => ({ id: i + 1, image_path: img })));
  }, [initialImages]);


  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remaining = maxImages - images.length;
    if (files.length > remaining) alert(`You can only add ${remaining} more image(s).`);
    const newImages = files.slice(0, remaining).map(file => ({ id: Date.now() + Math.random(), file }));
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const confirmDelete = () => {
    if (imageToDelete === null) return;
    setDeleting(true);
    setImages((prev) => prev.filter((img) => img.id !== imageToDelete));
    setDeleting(false);
    setImageToDelete(null);
    setConfirmingDelete(false);
  };

  return (
    <div className="flex flex-wrap gap-2 relative">
      {images.map((img) => {
        const src = resolveSrc(img.image_path);
        return (
          <div
            key={img.id}
            className="relative w-30 h-30 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 transform transition-transform duration-300 hover:scale-105"
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
          className="w-30 h-30 flex items-center justify-center border border-dashed border-gray-400 dark:border-gray-600 rounded-md text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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

      {zoomedImage && <ZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />}

      <DeleteConfirmationModal
        show={confirmingDelete}
        onClose={() => {
          setConfirmingDelete(false);
          setImageToDelete(null);
        }}
        item={"image"}
        onConfirm={confirmDelete}
        deleting={deleting}
      />
    </div>
  );
}
