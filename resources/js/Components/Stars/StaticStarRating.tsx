import React from "react";

interface StaticStarRatingProps {
  rating: number;  // e.g., 4.5
  size?: number;
}

export default function StaticStarRating({ rating, size = 16 }: StaticStarRatingProps) {
  const activeClass = "text-yellow-500 dark:text-[#7289da] drop-shadow-[0_0_3px_#facc15] dark:drop-shadow-[0_0_4px_#7289da]";
  // Stronger stroke for inactive stars:
  // Darker gray stroke, thicker strokeWidth, no fill
  const inactiveStrokeColor = "currentColor"; // will take color from class
  const inactiveClass = "text-gray-500 dark:text-gray-400"; // darker gray for outline

  const starPath =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

  return (
    <div className="flex gap-0.5 items-center" aria-label={`Rating: ${rating} out of 5 stars`} role="img">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        const isFull = rating >= starValue;
        const isHalf = rating >= starValue - 0.5 && rating < starValue;

        if (isFull) {
          return (
            <svg
              key={i}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className={activeClass}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={starPath} />
            </svg>
          );
        } else if (isHalf) {
          return (
            <svg
              key={i}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={activeClass}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`halfGradient${i}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path fill={`url(#halfGradient${i})`} d={starPath} />
              <path fill="none" stroke="currentColor" strokeWidth="1" d={starPath} />
            </svg>
          );
        } else {
          return (
            <svg
              key={i}
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="none"
              stroke={inactiveStrokeColor}
              strokeWidth="2"   // increased from 1 to 2
              aria-hidden="true"
              className={inactiveClass}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d={starPath} />
            </svg>
          );
        }
      })}
    </div>
  );
}
