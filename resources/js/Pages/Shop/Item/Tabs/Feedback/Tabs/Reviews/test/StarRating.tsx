import React, { useState } from "react";
import { useReviews } from "@/Contexts/Shop/Items/ReviewsContext"; // Adjust import path as needed

export default function StarRating({ size = 40 }: { size?: number }) {
  const { rating, setRating } = useReviews();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeClass = `
    text-yellow-500 dark:text-[#7289da]
    drop-shadow-[0_0_4px_#facc15] dark:drop-shadow-[0_0_6px_#7289da]
    transition-transform transition-filter duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    scale-100 group-hover:scale-110
  `;

  const inactiveClass = `
    text-gray-300 dark:text-gray-600
    transition-transform transition-filter duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    scale-100 group-hover:scale-110
  `;

  const renderStar = (starIndex: number) => {
    const currentRating = hoverRating !== null ? hoverRating : rating;
    const starValue = starIndex + 1;

    const isActive = currentRating >= starValue;
    const isHalf = currentRating >= starValue - 0.5 && currentRating < starValue;

    const commonProps = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      className: `${isActive || isHalf ? activeClass : inactiveClass} transform`,
    };

    const starPath =
      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

    if (isActive) {
      return (
        <svg key={starIndex} {...commonProps} fill="currentColor">
          <path d={starPath} />
        </svg>
      );
    } else if (isHalf) {
      return (
        <svg key={starIndex} {...commonProps} fill="none" stroke="currentColor" strokeWidth="2">
          <defs>
            <linearGradient id={`halfGrad${starIndex}`}>
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill={`url(#halfGrad${starIndex})`} d={starPath} stroke="none" />
          <path d={starPath} />
        </svg>
      );
    } else {
      return (
        <svg key={starIndex} {...commonProps} fill="none" stroke="currentColor" strokeWidth="2">
          <path d={starPath} />
        </svg>
      );
    }
  };

  return (
    <div
      className="flex space-x-1 select-none"
      role="radiogroup"
      aria-label="Star rating"
    >
      {[...Array(5)].map((_, starIndex) => (
        <div
          key={`container-${starIndex}`}
          className="group relative cursor-pointer"
          onMouseLeave={() => setHoverRating(null)}
        >
          {/* Clickable half-star (left side) */}
          <button
            type="button"
            className="absolute left-0 top-0 w-1/2 h-full z-20 bg-transparent"
            aria-label={`${starIndex + 0.5} stars`}
            onClick={() => setRating(starIndex + 0.5)}
            onMouseEnter={() => setHoverRating(starIndex + 0.5)}
          />
          {/* Clickable full-star (right side) */}
          <button
            type="button"
            className="absolute right-0 top-0 w-1/2 h-full z-20 bg-transparent"
            aria-label={`${starIndex + 1} stars`}
            onClick={() => setRating(starIndex + 1)}
            onMouseEnter={() => setHoverRating(starIndex + 1)}
          />
          {/* Star SVG */}
          <div className="z-10 pointer-events-none">
            {renderStar(starIndex)}
          </div>
        </div>
      ))}
    </div>
  );
}
  