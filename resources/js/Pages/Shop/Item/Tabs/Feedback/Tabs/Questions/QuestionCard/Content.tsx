import React, { useState } from "react";
import { FaUserShield } from "react-icons/fa";
import { useQuestions } from "@/Contexts/Shop/Items/QuestionsContext";
import formatDate from "@/Functions/formatDate";
import QuestionText from "./Text";
import LikeDislikeButtons from "../../Components/LikeDislikeButtons";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import DangerButton from "@/Components/Buttons/DangerButton";
import Modal from "@/Components/Login/Modal";
import { Question } from "@/Contexts/Shop/Items/QuestionsContext";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { toast } from "react-toastify";

interface ContentProps {
  question: Question;
}

export default function Content({ question }: ContentProps) {
  const {
    openReplyFormId,
    setOpenReplyFormId,
    expandedIds,
    toggleExpandedId,
    refreshQuestions,
  } = useQuestions();

  const page = usePage();
  const authUser = page.props.auth?.user;

  const id = question.id?.toString() || "";
  const showReplyForm = openReplyFormId === id;
  const expanded = expandedIds.has(id);
  const repliesCount = question.replies_recursive?.length || 0;

  const toggleReplyForm = () => setOpenReplyFormId(showReplyForm ? null : id);
  const toggleExpanded = () => toggleExpandedId(id);

  const createdAt = new Date(question.date);
  const now = new Date();
  const minutesSinceCreated = (now.getTime() - createdAt.getTime()) / 60000;
  const canEdit = minutesSinceCreated <= 10;
  const isOwner = question.user?.id === authUser?.id;
  const isAdmin = authUser?.is_admin || authUser?.isAdmin;

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(question.question);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    setEditedText(question.question);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    try {
      await axios.post(`/questions/${question.id}/update`, {
        question: editedText,
      });
      setIsEditing(false);
      question.question = editedText;
      toast.success("Question updated!");
    } catch (error) {
      console.error("Failed to update question:", error);
      toast.error("Failed to update question.");
    }
  };

  const confirmDelete = () => setConfirmingDelete(true);
  const closeDeleteModal = () => setConfirmingDelete(false);

  const deleteQuestion = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/questions/${question.id}`);

      if (question.parent_id === null) {
        toast.success("Question and its replies deleted");
      } else {
        toast.success("Reply deleted");
      }

      setConfirmingDelete(false);
      refreshQuestions();
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast.error("Failed to delete question.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1 justify-between relative min-h-[100px]">
        <div className="flex flex-col flex-grow basis-4/5">
          <div className="flex flex-col gap-0.5 mb-2">
            <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-white">
              {question.user?.name ?? "Unknown"}
              {question.isAdmin && (
                <FaUserShield
                  className="text-2xl"
                  title="Admin"
                  aria-label="Admin"
                />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {formatDate(question.date)}
              </span>

              {question.parent_id === null && question.category && (
                <span className="inline-block text-white bg-yellow-500 dark:bg-[#7289da] px-2 py-0.5 rounded-md shadow font-semibold">
                  {question.category}
                </span>
              )}
            </div>
          </div>


          {isEditing ? (
            <textarea
              className="rounded-lg bg-white text-gray-900 dark:text-white dark:bg-[#1e2124]/30 mt-2 border border-black/20 dark:border-white/20 p-3"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
            />
          ) : (
            <QuestionText text={question.question} />
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center justify-between mt-2 w-full">
            <div className="flex gap-2">
              <PrimaryButton
                onClick={toggleReplyForm}
                className="text-[13px] font-semibold px-3 py-1"
                type="button"
              >
                {showReplyForm ? "Cancel" : "Reply"}
              </PrimaryButton>

              {repliesCount > 0 && (
                <SecondaryButton
                  onClick={toggleExpanded}
                  className="text-[13px] font-semibold px-3 py-1"
                  type="button"
                >
                  {expanded ? "Hide Replies" : `Show (${repliesCount})`}
                </SecondaryButton>
              )}
            </div>

            <div className="flex gap-8 items-center">
              {(isOwner || isAdmin) && (
                <div className="flex gap-2">
                  {(isOwner && canEdit) || isAdmin ? (
                    <SecondaryButton
                      onClick={startEdit}
                      className="text-[13px] font-semibold px-3 py-1"
                    >
                      Edit
                    </SecondaryButton>
                  ) : null}
                  <SecondaryButton
                    onClick={confirmDelete}
                    className="text-[13px] font-semibold px-3 py-1 text-red-600 border-red-500"
                  >
                    Delete
                  </SecondaryButton>
                </div>
              )}
              <LikeDislikeButtons
                initialLikes={question.likes || 0}
                initialDislikes={question.dislikes || 0}
              />
            </div>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-2 mt-2">
            <PrimaryButton
              onClick={saveEdit}
              className="text-[13px] font-semibold px-3 py-1"
            >
              Save
            </PrimaryButton>
            <SecondaryButton
              onClick={cancelEdit}
              className="text-[13px] font-semibold px-3 py-1"
            >
              Cancel
            </SecondaryButton>
          </div>
        )}
      </div>

      <Modal show={confirmingDelete} onClose={closeDeleteModal}>
        <div className="p-6 flex flex-col items-center font-Poppins text-center">
          <h2 className="text-lg font-medium text-black dark:text-black">
            Are you sure you want to delete this question?
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Once deleted, this question and all its replies will be permanently removed.
          </p>
          <div className="mt-6 flex justify-center gap-3 w-full">
            <SecondaryButton
              onClick={closeDeleteModal}
              className="rounded-lg p-2 px-4"
            >
              Cancel
            </SecondaryButton>
            <DangerButton
              onClick={deleteQuestion}
              disabled={deleting}
              className="rounded-lg p-2 px-4"
            >
              {deleting ? "Deleting..." : "Delete"}
            </DangerButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
