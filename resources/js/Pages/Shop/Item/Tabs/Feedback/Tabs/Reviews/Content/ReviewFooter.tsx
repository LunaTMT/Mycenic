import React from "react";
import { usePage } from "@inertiajs/react";
import PrimaryButton from "@/Components/Buttons/PrimaryButton";
import SecondaryButton from "@/Components/Buttons/SecondaryButton";
import LikeDislikeButtons from "../../Components/LikeDislikeButtons";
import ActionsDropdown from "../../../ActionDropdown";
import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";

interface Props {
  repliesCount: number;
  expanded: boolean;
  showReplyForm: boolean;
  onToggleReplyForm: () => void;
  onToggleExpanded: () => void;
  isOwner: boolean;
  canEdit: boolean;
  isAdmin: boolean;
  reviewId: number;
  likes: number;
  dislikes: number;
  isEditing: boolean;
}

export default function ReviewFooter({
  repliesCount,
  expanded,
  showReplyForm,
  onToggleReplyForm,
  onToggleExpanded,
  isOwner,
  canEdit,
  isAdmin,
  reviewId,
  likes,
  dislikes,
  isEditing,
}: Props) {
  const { props } = usePage();
  const authUser = props.auth?.user;

  if (isEditing) return null;

  return (
    <>
      <div className="flex items-center justify-between mt-4 w-full">
        <div className="flex gap-2">
          {authUser && (
            <PrimaryButton
              onClick={onToggleReplyForm}
              className="text-[13px] font-semibold px-3 py-1"
              type="button"
            >
              {showReplyForm ? "Cancel" : "Reply"}
            </PrimaryButton>
          )}

          {repliesCount > 0 && (
            <SecondaryButton
              onClick={onToggleExpanded}
              className="text-[13px] font-semibold px-3 py-1"
              type="button"
            >
              {expanded ? "Hide Replies" : `Show (${repliesCount})`}
            </SecondaryButton>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LikeDislikeButtons initialLikes={likes} initialDislikes={dislikes} />
          {authUser && (
            <ActionsDropdown
              reviewId={reviewId}
              isOwner={isOwner}
              canEdit={canEdit}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>

      {!authUser && showReplyForm && (
        <div className="mt-4 w-full">
          <AuthNotice />
        </div>
      )}
    </>
  );
}
