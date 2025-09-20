import React from "react";

interface ArrowIconProps {
  w: string;
  h: string;
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({
  w,
  h,
  isOpen,
  onClick,
  className = "",
  ariaLabel = "Toggle",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`flex items-center justify-center ${onClick ? "cursor-pointer" : ""} transition duration-300 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`text-black dark:text-white transform transition-transform duration-500 ${
          isOpen ? "rotate-180" : ""
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width={w}
        height={h}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
};

export default ArrowIcon;
