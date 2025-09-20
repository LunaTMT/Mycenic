import React from "react";

interface WelcomeCardProps {
    title: string;
    description: string;
    icon: React.ReactElement; // Expecting a React element for the icon
    className: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ title, description, icon, className }) => {
    return (
        <a
            className={`relative flex flex-col p-10 gap-5 w-full h-full
                rounded-lg z-30 overflow-hidden  shadow-xl group hover:bg-white/50 
                
                ${className}`}
        >
            {/* Title */}
            <h2 className="text-7xl font-Aileron_UltraLight text-black 
                group-hover:text-black
                transition-all duration-300 transform group-hover:translate-x-[20px]">
                {title}
            </h2>

            {/* Paragraph */}
            <p className="text-lg text-slate-700 group-hover:text-black">
                {description}
            </p>

            {/* Icon */}
            <div
                className="absolute right-10 w-32 h-32 
                rounded-xl bg-gradient-to-r from-sky-400 to-slate-700
               
                text-white
                 "
            >
                {icon}
            </div>
        </a>
    );
};

export default WelcomeCard;
