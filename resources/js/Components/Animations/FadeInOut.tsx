import { motion, useScroll, useTransform } from "framer-motion";
import React, { ReactNode, useRef } from "react";

interface FadeInOutProps {
  children: ReactNode;
}

const FadeInOut: React.FC<FadeInOutProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track the scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map scrollYProgress to opacity for the container
  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.7, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full"
      style={{
        opacity, // Apply the opacity transformation based on scroll progress
      }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInOut;
