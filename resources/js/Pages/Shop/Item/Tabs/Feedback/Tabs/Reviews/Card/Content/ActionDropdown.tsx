import React, { useState } from "react";
import Dropdown from "@/Components/Dropdown/Dropdown";
import { BsThreeDots } from "react-icons/bs";
import { useReviews, Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import { usePage } from "@inertiajs/react";
import DeleteConfirmationModal from "./ImageGallery/DeleteConfirmationModal";
import { toast } from "react-toastify";

interface ActionsDropdownProps {
  reviewId: number;
  isOwner: boolean;
  canEdit: boolean;
  isAdmin: boolean;
  review?: Review;
}

export default function ActionsDropdown({
  reviewId,
  isOwner,
  canEdit,
  isAdmin,
  review,
}: ActionsDropdownProps) {
  const { props } = usePage();
  const authUser = props.auth?.user;

  if (!authUser) return null;

  const {
    setIsEditingId,
    confirmingDeleteId,
    setConfirmingDeleteId,
    deleteReview,
    deleting,
    setDeleting,
  } = useReviews();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleEdit = () => setIsEditingId(reviewId.toString());
  const handleDelete = () => setConfirmingDeleteId(reviewId.toString());
  const closeDeleteModal = () => setConfirmingDeleteId(null);

  const canDelete = isOwner || isAdmin;
  const isConfirmingDelete = confirmingDeleteId === reviewId.toString();

  const itemString = review?.parent_id ? "reply" : "review";

  const onConfirmDelete = () => {
    setDeleting(true);
    deleteReview(reviewId).then((success) => {
      if (success) {
        toast.success(
          `${itemString.charAt(0).toUpperCase() + itemString.slice(1)} deleted successfully`
        );
        setConfirmingDeleteId(null);
      }
      setDeleting(false);
    });
  };

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
            contentClasses="bg-white dark:bg-[#424549] shadow-lg z-50"
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

      <DeleteConfirmationModal
        show={isConfirmingDelete}
        onClose={closeDeleteModal}
        onConfirm={onConfirmDelete}
        deleting={deleting}
        item={itemString}
        message={`Once deleted, this ${itemString} and all its replies will be permanently removed.`}
      />



    </>
  );
}
