import { motion } from "framer-motion";
import React, { useState } from "react";

const LearnMoreButton: React.FC = () => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1 }}
            transition={{ type: "tween", stiffness: 400, damping: 17 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`
                relative inline-flex items-center justify-center 
                py-3 my-5  
                text-4xl font-medium text-center text-white 
                bg-transparent
                font-Aeleron_Thin
             
            `}
        >
            Learn more
            <motion.svg
                animate={{ x: isHovering? 5: 0}}
                transition={{ duration: 0.5}}
                className={`
                    w-6 h-6 ms-2 rtl:rotate-180 
                    transition-all duration-300 ease-in-out
                `}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                />
            </motion.svg>

            {/* Underline div */}
            <motion.div
                animate={{ width: isHovering ? "100%" : "0%" }}
                className={`absolute left-0 bottom-0 h-[2px] rounded-full  bg-white
                bg-gradient-to-r from-sky-500 to-white
                ${isHovering? "shadow-[0_0_20px_5px_rgba(0,182,255,0.6)]" : ""}
                `}
                transition={{ duration: 0.5 }}
            />
        </motion.button>
    );
};

export default LearnMoreButton;
