import React from "react";
import Modal from "@/Components/Login/Modal";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import DangerButton from "@/Components/Buttons/DangerButton";

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

export default function DeleteConfirmationModal({ show, onClose, onConfirm, deleting }: Props) {
  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-6 flex flex-col items-center font-Poppins text-center">
        <h2 className="text-lg font-medium text-black dark:text-white">Are you sure you want to delete this review?</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Once deleted, this review and all its replies will be permanently removed.
        </p>
        <div className="mt-6 flex justify-center gap-3 w-full">
          <SecondaryButton onClick={onClose} className="rounded-lg p-2 px-4">Cancel</SecondaryButton>
          <DangerButton onClick={onConfirm} disabled={deleting} className="rounded-lg p-2 px-4">
            {deleting ? "Deleting..." : "Delete"}
          </DangerButton>
        </div>
      </div>
    </Modal>
  );
}
