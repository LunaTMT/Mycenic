import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/Components/Login/Modal";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import DangerButton from "@/Components/Buttons/DangerButton";

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
  item: string;
  message: string;
  imageUrl?: string;
}

export default function DeleteConfirmationModal({
  show,
  onClose,
  onConfirm,
  deleting,
  item,
  message,
  imageUrl,
}: Props) {
  return (
    <AnimatePresence>
      {show && (
        <Modal show={show} onClose={onClose}>
          <motion.div
            key="delete-modal"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0, ease: "easeInOut" }}
            className="p-6 flex flex-col items-center font-Poppins  text-center"
          >
            <h2 className="text-lg font-medium text-black dark:text-white">
              Are you sure you want to delete this {item}?
            </h2>

            {imageUrl && (
              <img
                src={imageUrl}
                alt={`Preview of ${item}`}
                className="my-4 max-w-xs rounded"
              />
            )}

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>

            <div className="mt-6 flex justify-center gap-3 w-full">
              <SecondaryButton onClick={onClose} className="rounded-lg p-2 px-4">
                Cancel
              </SecondaryButton>
              <DangerButton
                onClick={onConfirm}
                disabled={deleting}
                className="rounded-lg p-2 px-4"
              >
                {deleting ? "Deleting..." : "Delete"}
              </DangerButton>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
