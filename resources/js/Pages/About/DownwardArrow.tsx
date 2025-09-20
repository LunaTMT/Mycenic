import React from 'react';
import { motion } from 'framer-motion';

const DownwardArrow: React.FC = () => {
  return (
    <motion.div
      className="relative"
      animate={{ y: [0, 10, 0] }} // Moves up and down
      transition={{
        duration: 1, // Animation duration
        repeat: Infinity, // Repeat forever
        repeatType: 'loop', // Loop animation
        ease: 'easeInOut', // Smooth easing
      }}
    >
      {/* Downward Arrow */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="w-24 h-24 text-black/50 dark:text-white text-shadow-golden-glow"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.5"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </motion.div>
  );
};

export default DownwardArrow;