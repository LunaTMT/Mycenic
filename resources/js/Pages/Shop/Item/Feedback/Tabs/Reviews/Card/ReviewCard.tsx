  import React, { useState, useEffect } from "react";
  import { usePage, router } from "@inertiajs/react";
  import { toast } from "react-toastify";

  import Avatar from "./Content/Avatar";
  import { Review } from "@/types/Review";
  import { useReviews } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";


  import AuthNotice from "@/Pages/Shop/Item/Notices/AuthNotice";
  import ImageGallery from "./Content/ImageGallery";

  import ReviewHeader from "./Content/ReviewHeader";
  import ReviewContent from "./Content/ReviewContent";
  import RightActions from "./Content/RightActions";
  import ActionButtons from "./Content/ActionButtons";
  import ReplyForm from "./Content/ReplyForm";

  import { User } from "@/types/User";

  interface ReviewCardProps {
    review: Review;
    depth?: number;
  }



  export default function ReviewCard({ review, depth = 0 }: ReviewCardProps) {
    const { auth } = usePage().props as { auth: { user: User } };
    
    const { isExpanded, openReplyFormId } = useReviews();
    const expanded = isExpanded(review.id);
    const authUser = auth?.user ?? null;
    const replies = review.replies ?? [];
    const showAuthNotice = !authUser && openReplyFormId === review.id;


    return (
      <div
        className={`relative p-4 space-y-4 shadow-xl rounded-lg bg-white dark:bg-[#1e2124]/60 ${
          depth > 0
            ? "ml-3 pl-4 border-l-4 border-yellow-500 dark:border-[#7289da]"
            : "border border-black/20 dark:border-white/20"
        }`}
        style={{ marginLeft: depth * 12 }}
      >
        <div className="flex space-x-4">
          <Avatar review={review} />

          <div className="flex-1 break-words">
            <div className="min-h-[100px] flex flex-col justify-between space-y-3">
              <ReviewHeader review={review} />

              <div className="space-y-2">
                <ReviewContent review={review} />
                <ImageGallery review={review} />
              </div>

              <div className="flex flex-col gap-4 w-full">
                <ReplyForm review={review}/>

                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div className="flex gap-2 flex-wrap items-center">
                    <ActionButtons review={review}/>
                  </div>

                  <div className="flex items-center gap-3 ml-auto">
                    <RightActions review={review}/>
                  </div>
                </div>

                {showAuthNotice && <AuthNotice />} 
              </div>
            </div>
          </div>
        </div>

        {expanded && replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {replies.map((reply) => (
              <ReviewCard key={reply.id} review={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }
