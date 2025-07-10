import React from "react";

interface ArrowButtonProps {
  w: string;
  h: string;
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

const ArrowButton: React.FC<ArrowButtonProps> = ({
  w,
  h,
  isOpen,
  onClick,
  className = "",
  ariaLabel = "Toggle replies",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex items-center justify-center  
        transition duration-300  ${className}`}
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
    </button>
  );
};

export default ArrowButton;
