import React, { createContext, useContext, useState } from "react";

interface ReviewEditContextType {
  isEditingId: string | null;
  setIsEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  editedTextById: Record<number, string>;
  setEditedTextById: (id: number, value: string) => void;
  editedRatingById: Record<number, number>;
  setEditedRatingById: (id: number, value: number) => void;
  cancelEdit: () => void;

  confirmingDeleteId: string | null;
  setConfirmingDeleteId: React.Dispatch<React.SetStateAction<string | null>>;
  closeDeleteModal: () => void;

  deleting: boolean;
  setDeleting: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReviewEditContext = createContext<ReviewEditContextType | undefined>(undefined);

export const ReviewEditProvider = ({ children }: { children: React.ReactNode }) => {
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [editedTextById, setEditedTextByIdState] = useState<Record<number, string>>({});
  const [editedRatingById, setEditedRatingByIdState] = useState<Record<number, number>>({});

  const setEditedTextById = (id: number, value: string) => {
    setEditedTextByIdState((prev) => ({ ...prev, [id]: value }));
  };

  const setEditedRatingById = (id: number, value: number) => {
    setEditedRatingByIdState((prev) => ({ ...prev, [id]: value }));
  };

  const cancelEdit = () => setIsEditingId(null);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const closeDeleteModal = () => setConfirmingDeleteId(null);

  const [deleting, setDeleting] = useState(false);

  return (
    <ReviewEditContext.Provider
      value={{
        isEditingId,
        setIsEditingId,
        editedTextById,
        setEditedTextById,
        editedRatingById,
        setEditedRatingById,
        cancelEdit,
        confirmingDeleteId,
        setConfirmingDeleteId,
        closeDeleteModal,
        deleting,
        setDeleting,
      }}
    >
      {children}
    </ReviewEditContext.Provider>
  );
};

export const useReviewEdit = () => {
  const context = useContext(ReviewEditContext);
  if (!context) throw new Error("useReviewEdit must be used within ReviewEditProvider");
  return context;
};
