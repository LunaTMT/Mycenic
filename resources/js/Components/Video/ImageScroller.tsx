import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from "framer-motion";

interface ImageScrollerProps {
  images_folder_name: string;
  number_of_images: number;
}

const ImageScroller: React.FC<ImageScrollerProps> = ({ images_folder_name, number_of_images }) => {
  const [imageIndex, setImageIndex] = useState(1); // Default to the first image (index 0)
  
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["end center", "end start"]
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      console.log(value); // You can observe the scroll progress here
    })
    return () => unsubscribe();
  }, [scrollYProgress]);

  const getCurrentIndex = useTransform(scrollYProgress, [0, 1], [1, number_of_images - 1]);

  useEffect(() => {
    const unsubscribe = getCurrentIndex.onChange((value) => {
      setImageIndex(Math.round(value)); 
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [getCurrentIndex]);

  return (
    <div ref={ref} className="relative">
      <motion.img
        src={`/assets/images/scrolling/${images_folder_name}/${imageIndex}.png`}
        alt="Scrolling animation"
        className={`absolute top-0 left-0 
          object-contain
          w-full h-auto
          border border-red-400
        `}
      />
    </div>
  );
};

export default ImageScroller;
