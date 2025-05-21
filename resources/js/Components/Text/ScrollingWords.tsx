import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScrollingWordsProps {
  words: string[];
}

const ScrollingWords: React.FC<ScrollingWordsProps> = ({ words }) => {
  const gradients = [
    "from-sky-500 to-white",
    "from-sky-600 to-white",
    "from-sky-700 to-white",
    "from-sky-800 to-white",
    "from-sky-900 to-white",
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <motion.div
      className="inline-block text-center w-full font-extrabold font-Aileron_Thin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{ overflow: 'visible', display: 'inline-block' }} // Ensure no clipping and inline display
    >
      <motion.h1
        key={currentIndex} // Use `key` to trigger re-mount on currentIndex change
        className={`
          text-7xl
          bg-gradient-to-r
          bg-clip-text text-transparent
          transition-all duration-500 ease-in-out
          whitespace-nowrap // Prevent wrapping of text
          ${gradients[currentIndex]} // Update gradient based on current index
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
      >
        {words[currentIndex]}
      </motion.h1>
    </motion.div>
  );
};

export default ScrollingWords;
