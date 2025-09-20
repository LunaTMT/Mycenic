import React, { createContext, useContext, useState, useRef, useEffect } from "react";

interface Image {
  id: number;
  image_path: string;
  file?: File;
}

interface ReviewImagesContextType {
  imagesByReviewId: Record<number, Image[]>;
  addImage: (reviewId: number, file: File) => void;
  removeImage: (reviewId: number, id: number) => void;

  deletedImageIdsByReviewId: Record<number, number[]>;
  markImageForDeletion: (reviewId: number, imageId: number) => void;
  unmarkImageForDeletion: (reviewId: number, imageId: number) => void;
}

const ReviewImagesContext = createContext<ReviewImagesContextType | undefined>(undefined);

export const ReviewImagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [imagesByReviewId, setImagesByReviewId] = useState<Record<number, Image[]>>({});
  const [deletedImageIdsByReviewId, setDeletedImageIdsByReviewId] = useState<Record<number, number[]>>({});
  const deletedImageIdsRef = useRef<Record<number, number[]>>({});

  useEffect(() => {
    deletedImageIdsRef.current = deletedImageIdsByReviewId;
  }, [deletedImageIdsByReviewId]);

  const addImage = (reviewId: number, file: File) => {
    const newImage: Image = {
      id: Date.now() * -1,
      image_path: URL.createObjectURL(file),
      file,
    };
    setImagesByReviewId((prev) => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] || []), newImage],
    }));
  };

  const removeImage = (reviewId: number, id: number) => {
    setImagesByReviewId((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).filter((img) => img.id !== id),
    }));
  };

  const markImageForDeletion = (reviewId: number, imageId: number) => {
    setDeletedImageIdsByReviewId((prev) => {
      const prevDeleted = prev[reviewId] || [];
      return {
        ...prev,
        [reviewId]: [...new Set([...prevDeleted, imageId])],
      };
    });
  };

  const unmarkImageForDeletion = (reviewId: number, imageId: number) => {
    setDeletedImageIdsByReviewId((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || []).filter((id) => id !== imageId),
    }));
  };

  return (
    <ReviewImagesContext.Provider
      value={{
        imagesByReviewId,
        addImage,
        removeImage,
        deletedImageIdsByReviewId,
        markImageForDeletion,
        unmarkImageForDeletion,
      }}
    >
      {children}
    </ReviewImagesContext.Provider>
  );
};

export const useReviewImages = () => {
  const context = useContext(ReviewImagesContext);
  if (!context) throw new Error("useReviewImages must be used within ReviewImagesProvider");
  return context;
};
