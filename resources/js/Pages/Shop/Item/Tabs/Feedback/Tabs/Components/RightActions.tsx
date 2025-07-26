import React from "react";
import LikeDislikeButtons from "./LikeDislikeButtons";
import ActionsDropdown from "./ActionDropdown";
import { usePage } from "@inertiajs/react";
import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";

interface Props {
  review: Review;
}

export default function RightActions({ review }: Props) {
  const { auth } = usePage().props;
  const authUser = auth?.user;

  const isOwner = review.user?.id === authUser?.id;
  const isAdmin = !!authUser?.is_admin; // use your snake_case here

  const canEdit = isAdmin || isOwner;

  return (
    <div className="flex items-center gap-3 ml-auto">
      <LikeDislikeButtons
        reviewId={review.id!}
        initialLikes={review.likes || 0}
        initialDislikes={review.dislikes || 0}
      />
      {authUser && (
        <ActionsDropdown
          reviewId={review.id!}
          isOwner={isOwner}
          canEdit={canEdit}
          isAdmin={isAdmin}
          review={review}
        />
      )}
    </div>
  );
}
