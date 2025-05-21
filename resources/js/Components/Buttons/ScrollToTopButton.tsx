import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";

const ScrollTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
          onClick={ScrollToTop}
          className="z-50 fixed bottom-8 right-8 p-3 rounded-full 
                     bg-gradient-to-br from-yellow-500 to-amber-600 
                     dark:from-[#7289da] dark:to-[#0a36d4]
                     text-white shadow-xl 
                     hover:shadow-2xl focus:outline-none"
        >
          <FaArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
};

export default ScrollTop;

