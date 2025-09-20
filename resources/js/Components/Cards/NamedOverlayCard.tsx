import React, { useState } from "react";
import { motion } from "framer-motion";

// Define the type for the props
interface NamedOverlayCard {
    src: string;
    title: string;
    isClicked: boolean;  // Track if the card is clicked
    onClick: () => void;  // Function to handle the click event
}

const NamedOverlayCard: React.FC<NamedOverlayCard> = ({ src, title, isClicked, onClick }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    // Set hover state when mouse enters and leaves the card
    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <motion.div
            className="relative w-full h-full" // Ensure full width and height for the card
            onMouseEnter={handleMouseEnter} // Set hover state on mouse enter
            onMouseLeave={handleMouseLeave} // Reset hover state on mouse leave
            onClick={onClick} // Trigger the onClick handler when clicked
        >
            {/* Dark Overlay (visible when in view) */}
            <motion.div
                className="absolute inset-0 bg-black z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Image with Framer Motion for scaling and opacity */}
            <motion.div className="relative w-full h-full overflow-hidden">  {/* Apply rounded-full here */}
                <motion.img
                    src={src}
                    alt={title}
                    initial={{ scale: 1 }}
                    animate={{
                        scale: isClicked ? 1 : isHovered ? 1.1 : 1, // Scale down when clicked, up when hovered
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }} // Smooth scaling transition
                    className="w-full h-full object-cover" // Use object-cover to make the image fill the div and maintain aspect ratio
                />
            </motion.div>

            {/* Text with Framer Motion for opacity and underline on hover */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 flex justify-center items-center text-white 
                           
                           tracking-widest z-20 text-center
                           text-3xl 
                           lg:text-3xl "
            >
                <div className="relative">
                    {title}
                    {/* Animated Underline below the text */}
                    <motion.div
                        className="absolute left-0 bottom-0 h-[2px] bg-white transform"
                        animate={{
                            width: isHovered || isClicked ? "100%" : "0%",
                        }}
                        transition={{
                            width: { duration: 0.5, ease: "easeInOut" },
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NamedOverlayCard;
