import React from "react";

interface StaticStarRatingProps {
  rating: number;
  size?: number;
}

export default function StaticStarRating({ rating, size = 16 }: StaticStarRatingProps) {
  const activeClass = `
    text-yellow-500 dark:text-[#7289da]
    drop-shadow-[0_0_3px_#facc15] dark:drop-shadow-[0_0_4px_#7289da]
  `;

  const inactiveClass = `
    text-gray-300 dark:text-gray-600
  `;

  const starPath =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

  return (
    <div className="flex gap-[2px] items-center">
      {[...Array(5)].map((_, i) => {
        const isActive = rating >= i + 1;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={isActive ? activeClass : inactiveClass}
          >
            <path d={starPath} />
          </svg>
        );
      })}
    </div>
  );
}
