import React, { useRef } from "react";
import { FaTrashAlt, FaPlus } from "react-icons/fa";

interface Image {
  id: number;
  image_path: string;
}

interface Props {
  isEditing: boolean;
  images: Image[];
  onImageClick: (url: string) => void;
  onImageRemove: (id: number) => void;
  onImageAdd: (file: File) => void;
}

export default function ReviewImageGallery({
  isEditing,
  images,
  onImageClick,
  onImageRemove,
  onImageAdd,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = 5 - images.length;

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onImageAdd(e.target.files[0]);
      e.target.value = "";
    }
  };
  console.log("imgs :", images);
  return (
    <div className="mt-6 my-3 flex flex-wrap gap-2 relative">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative group w-30 h-30 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600"
        >
          <img
            src={img.image_path}
            alt="Review image"
            className="w-full h-full object-cover cursor-pointer z-0"
            onClick={() => onImageClick(img.image_path)}
          />

          {isEditing && (
            <>
              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity z-5" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageRemove(img.id);
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

      {isEditing && remaining > 0 && (
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
          />
        </button>
      )}
    </div>
  );
}
