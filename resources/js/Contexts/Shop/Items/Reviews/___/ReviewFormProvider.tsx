import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface ReviewFormContextType {
  reviewText: string;
  setReviewText: React.Dispatch<React.SetStateAction<string>>;
  rating: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
  errors: { review?: string };
  setErrors: React.Dispatch<React.SetStateAction<{ review?: string }>>;
  processing: boolean;
  submitReview: (authUser: any, category: string, rating: number) => Promise<boolean>;
  MAX_LENGTH: number;
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const ReviewFormContext = createContext<ReviewFormContextType | undefined>(undefined);

export const ReviewFormProvider = ({ children }: { children: React.ReactNode }) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState<{ review?: string }>({});
  const [processing, setProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const MAX_LENGTH = 300;

  const submitReview = async (authUser: any, category: string, rating: number) => {
    setErrors({});
    if (!reviewText.trim()) {
      setErrors({ review: "Please enter your review." });
      return false;
    }
    if (reviewText.length > MAX_LENGTH) {
      setErrors({ review: `Max ${MAX_LENGTH} characters.` });
      return false;
    }
    if (!authUser || !category || rating <= 0) {
      toast.error("All fields required.");
      return false;
    }
    setProcessing(true);
    try {
      await axios.post("/reviews", { content: reviewText, category, rating });
      setReviewText("");
      setRating(0);
      toast.success("Review submitted");
      return true;
    } catch {
      toast.error("Submit failed");
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ReviewFormContext.Provider
      value={{
        reviewText,
        setReviewText,
        rating,
        setRating,
        errors,
        setErrors,
        processing,
        submitReview,
        MAX_LENGTH,
        showForm,
        setShowForm,
      }}
    >
      {children}
    </ReviewFormContext.Provider>
  );
};

export const useReviewForm = () => {
  const context = useContext(ReviewFormContext);
  if (!context) throw new Error("useReviewForm must be used within ReviewFormProvider");
  return context;
};
