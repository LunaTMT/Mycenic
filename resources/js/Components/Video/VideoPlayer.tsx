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
      {/* Video */}
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

      {/* Gradient Overlay (Bottom) */}


      {/* Content */}



      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-5"
      >
        {/* Logo */}
        <img
          src="/assets/images/logo2.png"
          alt="Mycenic Logo"
          className="w-[40%] rounded-full shadow-[0_0_15px_5px_rgba(245,245,220,0.8)] hover:shadow-[0_0_25px_15px_rgba(245,245,220,1)]"
          style={{ animation: "shadowPulse 5s ease-in-out infinite" }}
        />

        {/* Animated Heading */}
        <motion.h1
          className="font-Audrey text-transparent bg-clip-text bg-gradient-to-t text-[175px] leading-tight from-[#e7e77a] to-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          MYCENIC
        </motion.h1>
      </div>

      {/* Trustpilot Widget positioned bottom right */}
      <div className="absolute bottom-4 right-6 ">
        <TrustpilotWidget />
      </div>
    </div>
  );
};

export default VideoPlayer;
