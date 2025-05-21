import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  className?: string;
}

const LightCircles: React.FC<Props> = ({ className }) => {
  return (
    <div className="overflow-hidden">
      {/* Left background image */}
      <motion.div
        className={`w-[20%] fixed top-0 left-0 ${className}`}
        animate={{
          scale: [1, 1.1, 1], // Grow and shrink effect
          y: [0, -20, 0], // Float up and down
          rotate: [0, 360], // Slowly rotate
        }}
        transition={{
          duration: 30, // Increased duration for slower rotation
          repeat: Infinity, // Repeat the animation indefinitely
          repeatType: 'loop',
          ease: 'easeInOut', // Smooth easing
        }}
      >
        <img
          id="background-left"
          className="w-full h-auto"
          src="/assets/images/background/circle.png"
          alt="Background Left"
        />
      </motion.div>

      {/* Right background image */}
      <motion.div
        className={`w-[30%] fixed top-0 right-0 -translate-x-1/2 ${className}`}
        animate={{
          scale: [1, 1.1, 1], // Grow and shrink effect
          y: [0, -20, 0], // Float up and down
          rotate: [0, 360], // Slowly rotate
        }}
        transition={{
          duration: 30, // Increased duration for slower rotation
          repeat: Infinity, // Repeat the animation indefinitely
          repeatType: 'loop',
          ease: 'easeInOut', // Smooth easing
        }}
      >
        <img
          id="background-right"
          className="w-full h-auto"
          src="/assets/images/background/circle.png"
          alt="Background Right"
        />
      </motion.div>
    </div>
  );
};

export default LightCircles;
