import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface VideoScrollProps {
  videoSrc: string;
  scrollYProgress: any;  // Add scrollYProgress as a prop
}

const VideoScroll: React.FC<VideoScrollProps> = ({ videoSrc, scrollYProgress }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Map scroll progress to video playback time
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((progress) => {
      if (videoRef.current) {
        
        const videoDuration = videoRef.current.duration || 0;
        videoRef.current.currentTime = progress * videoDuration; // Map progress (0 to 1) to video duration
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [scrollYProgress]);

  return (
    <motion.video ref={videoRef} preload="preload" className="fixed bottom-0 left-0 w-full" muted>
      <source src={videoSrc} type='video/mp4' />
    </motion.video>

    // this works
    // The reason this doesn't work on chrome is because the 'accept range bytes header' is not appearing when configured 
    // "https://www.apple.com/media/us/mac-pro/2013/16C1b6b5-1d91-4fef-891e-ff2fc1c1bb58/videos/macpro_main_desktop.mp4"
  );
};

export default VideoScroll;


