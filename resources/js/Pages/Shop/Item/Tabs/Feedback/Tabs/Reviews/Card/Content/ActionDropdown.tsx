import React, { useState } from "react";
import Dropdown from "@/Components/Dropdown/Dropdown";
import { BsThreeDots } from "react-icons/bs";
import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import Modal from "@/Components/Login/Modal";
import { usePage } from "@inertiajs/react";

interface ActionsDropdownProps {
  reviewId: number;
  isOwner: boolean;
  canEdit: boolean;
  isAdmin: boolean;
}

export default function ActionsDropdown({
  reviewId,
  isOwner,
  canEdit,
  isAdmin,
}: ActionsDropdownProps) {
  const { props } = usePage();
  const authUser = props.auth?.user;

  // If user not logged in, don't show anything
  if (!authUser) {
    return null;
  }

  const {
    setIsEditingId,
    setConfirmingDeleteId,
    deleteReview,
    setDeleting,
    deleting,
    setConfirmingDeleteId: setConfirmingDeleteIdState,
  } = useReviews();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleEdit = () => setIsEditingId(reviewId.toString());
  const handleDelete = () => setConfirmingDeleteId(reviewId.toString());
  const closeDeleteModal = () => setConfirmingDeleteIdState(null);

  const canDelete = isOwner || isAdmin;

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setShowDropdown(true)}
        onMouseLeave={() => setShowDropdown(false)}
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <Dropdown onOpenChange={setShowDropdown}>
          <Dropdown.Trigger>
            <div className="flex justify-center items-center cursor-pointer p-1 rounded text-gray-700 dark:text-white/70 hover:text-black dark:hover:text-white">
              <BsThreeDots size={20} />
            </div>
          </Dropdown.Trigger>

          <Dropdown.Content
            width="fit"
            contentClasses="bg-white dark:bg-[#424549] shadow-lg  z-50"
          >
            <ul className="text-sm font-Poppins text-right w-full">
              {(isOwner && canEdit) || isAdmin ? (
                <li
                  onClick={handleEdit}
                  className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70"
                >
                  Edit
                </li>
              ) : null}

              {canDelete && (
                <li
                  onClick={handleDelete}
                  className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70"
                >
                  Delete
                </li>
              )}
            </ul>
          </Dropdown.Content>
        </Dropdown>
      </div>

      <Modal show={Boolean(deleting)} onClose={closeDeleteModal}>
        <div className="p-6 flex flex-col items-center text-center font-Poppins">
          <h2 className="text-lg font-medium text-black dark:text-white">
            Are you sure you want to delete this review?
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Once deleted, this review and all its replies will be permanently removed.
          </p>
          <ul className="mt-6 flex justify-center gap-3 w-full text-sm">
            <li
              onClick={closeDeleteModal}
              className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70 rounded"
            >
              Cancel
            </li>
            <li
              onClick={() => {
                setDeleting(true);
                deleteReview(reviewId).then((success) => {
                  if (success) setConfirmingDeleteIdState(null);
                  setDeleting(false);
                });
              }}
              className="cursor-pointer px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-400/50 dark:hover:bg-[#7289da]/70 rounded"
            >
              {deleting ? "Deleting..." : "Delete"}
            </li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
