import React, { useRef } from "react";
import { motion } from "framer-motion";
import TrustpilotWidget from "../Widgets/TrustPilot";


interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <div className="w-full h-[94vh] relative">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="w-screen h-full object-cover"
        autoPlay
        muted
        loop
        onEnded={handleEnded}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content with Perspective */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-5"
        style={{ perspective: "1000px" }}
      >
        {/* Static Tilted Logo */}
        <motion.img
          src="/assets/images/logo2.png"
          alt="Mycenic Logo"
          className="w-[40%] rounded-full shadow-[0_0_8px_2px_rgba(245,245,220,0.4)] hover:shadow-[0_0_15px_6px_rgba(245,245,220,0.5)] transition-shadow duration-300"
          initial={{ opacity: 0, scale: 0.8, rotateX: -8, rotateY: 12 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformStyle: "preserve-3d" }}
        />

        {/* Animated Heading */}
        <motion.h1
          className="font-Audrey text-transparent bg-clip-text bg-gradient-to-t text-[175px] leading-tight from-[#e7e77a] to-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
        >
          MYCENIC
        </motion.h1>
      </div>
    </div>
  );
};

export default VideoPlayer;
