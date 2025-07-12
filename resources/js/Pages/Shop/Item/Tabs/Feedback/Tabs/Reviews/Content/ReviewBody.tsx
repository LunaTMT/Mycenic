import React, { useState, useEffect } from "react";
import ReviewImageGallery from "./ReviewImageGallery";
import ReviewInputArea from "../Form/ReviewInputArea";

interface Image {
  id: number;
  image_path: string;
}

interface Props {
  isEditing: boolean;
  content: string;
  editedText: string;
  onTextChange: (value: string) => void;
  editedRating: number;
  onRatingChange: (val: number) => void;
  editedImage: File | null;
  onImageChange: (file: File | null) => void;
  images: Image[];  // <-- new prop
}

export default function ReviewBody({
  isEditing,
  content,
  editedText,
  onTextChange,
  editedRating,
  onRatingChange,
  editedImage,
  onImageChange,
  images: initialImages,  // renamed prop to avoid name conflict
}: Props) {
  const [images, setImages] = useState<Image[]>([]);

  // Sync local images state with initialImages prop
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleImageClick = (url: string) => setZoomedImage(url);
  const handleImageRemove = (id: number) =>
    setImages((prev) => prev.filter((img) => img.id !== id));
  const handleImageAdd = (file: File) => {
    const newImage: Image = {
      id: Date.now(),
      image_path: URL.createObjectURL(file), // preview only
    };
    setImages((prev) => [...prev, newImage]);
  };

  return (
    <>
      {isEditing ? (
        <ReviewInputArea
          review={editedText}
          onReviewChange={onTextChange}
          rating={editedRating}
          onRatingChange={onRatingChange}
          image={editedImage}
          onImageChange={onImageChange}
          maxLength={1000}
          error={undefined}
        />
      ) : (
        <div className="w-full break-words text-gray-800 dark:text-gray-100 bg-red-400 text-sm leading-relaxed">
          {content}
        </div>
      )}

      <ReviewImageGallery
        isEditing={isEditing}
        images={images}
        onImageClick={handleImageClick}
        onImageAdd={handleImageAdd}
        onImageRemove={handleImageRemove}
      />

      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-zoom-out"
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-[90vw] max-h-[90vh] rounded-md"
          />
        </div>
      )}
    </>
  );
}
