import React from "react";
import { Review } from "@/Contexts/Shop/Items/Reviews/ReviewsContext";
import ReviewHeader from "../../../Components/UserContentHeader";
import ReviewBody from "./ReviewBody";
import ReplyForm from "../../../Components/ReplyForm";
import FooterButtons from "../../../Components/FooterButton";
import RightActions from "../../../Components/RightActions";

interface ReviewContentProps {
  review: Review;
}

export default function ReviewContent({ review }: ReviewContentProps) {
  return (
    <div className="relative min-h-[100px] flex flex-col flex-1 justify-between">
      <div className="space-y-2">
        <ReviewHeader review={review} />
        <ReviewBody review={review} />
      </div>

      <div className="mt-4 space-y-3">
        <ReplyForm review={review} />
        <div className="flex justify-between items-center flex-wrap gap-3">
          <FooterButtons review={review} />
          <RightActions review={review} />
        </div>
      </div>
    </div>
  );
}
