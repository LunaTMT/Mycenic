import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import { Autoplay } from "swiper/modules";

import PrimaryButton from "@/Components/Buttons/PrimaryButton"; 


interface Review {
  customerName: string;
  reviewText: string;
  rating: number;
  date: string;
}

const reviews: Review[] = [
  {
    customerName: "John Doe",
    reviewText:
      "Amazing experience! The product quality was outstanding, and the customer support was exceptional.",
    rating: 5,
    date: "January 15, 2025",
  },
  {
    customerName: "Jane Smith",
    reviewText:
      "The delivery was fast, and the product exceeded my expectations. Highly recommend!",
    rating: 4,
    date: "January 10, 2025",
  },
  {
    customerName: "Alice Brown",
    reviewText:
      "Good quality product, but the packaging could be improved. Overall, a great purchase.",
    rating: 4,
    date: "January 8, 2025",
  },
  {
    customerName: "John Doe",
    reviewText:
      "Amazing experience! The product quality was outstanding, and the customer support was exceptional.",
    rating: 5,
    date: "January 15, 2025",
  },
  {
    customerName: "Jane Smith",
    reviewText:
      "The delivery was fast, and the product exceeded my expectations. Highly recommend!",
    rating: 4,
    date: "January 10, 2025",
  },
  {
    customerName: "Alice Brown",
    reviewText:
      "Good quality product, but the packaging could be improved. Overall, a great purchase.",
    rating: 4,
    date: "January 8, 2025",
  },
];

const renderStars = (rating: number) =>
  Array.from({ length: 5 }).map((_, i) => (
    <svg
      key={i}
      xmlns="http://www.w3.org/2000/svg"
      fill={i < rating ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`w-5 h-5 ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 17.75L7.605 20.508l.84-4.897L4.833 11.99l4.922-.715L12 6.745l2.245 4.531 4.922.715-3.612 3.621.84 4.897L12 17.75z"
      />
    </svg>
  ));

const CustomerReviews: React.FC = () => (
  <div className="w-full h-full "> 
    <section className="min-h-screen h-full space-y-5 font-Poppins w-full flex flex-col justify-center items-center">
      
      
      <h1 className="text-7xl font-Audrey text-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-t  dark:via-white/70 dark:from-slate-200  dark:to-white leading-tight dark:text-#f5f5dc dark:text-shadow-beige-glow">
        CUSTOMER REVIEWS
      </h1>
      <p className="font-Poppins text-gray-600 dark:text-gray-400">
        Verified reviews from real customers.
      </p>
    

      {reviews.length > 0 ? (
        <Swiper
          slidesPerView={5}
          spaceBetween={20}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          modules={[Autoplay]}
          className="mySwiper w-full h-1/3 mask-gradient"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={index} className="p-5">
              <div className="bg-white space-y-5 rounded-4xl flex flex-col justify-around h-full dark:bg-transparent">
                
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {review.customerName}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {review.date}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 ">
                  {review.reviewText}
                </p>
                <div className="flex justify-center items-center ">
                  {renderStars(review.rating)}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="flex flex-col justify-center items-center m-32">
          <p className="text-gray-600 dark:text-gray-400 text-xl font-Poppins ">
            There are currently no reviews. Be the first to leave one!
          </p>
        </div>
      )}

      <div className="flex justify-center items-center flex-col mt-8">
        <PrimaryButton
          onClick={() => window.open("https://www.trustpilot.com", "_blank")} // Open in a new tab
        >
          LEAVE A REVIEW
        </PrimaryButton>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Powered by Trustpilot
        </p>
      </div>
    </section>
  </div>
);

export default CustomerReviews;