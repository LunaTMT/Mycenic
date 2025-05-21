interface ArrowIconProps {
    w: string; // Width
    h: string; // Height
    isOpen: boolean; // Boolean to determine rotation
}

const ArrowIcon: React.FC<ArrowIconProps> = ({ w, h, isOpen }) => {
    return (
        <svg
            className={`text-black z-50 dark:text-white transform transition-transform duration-500 ${
                isOpen ? 'rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width={w} // Use passed width
            height={h} // Use passed height
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
    );
};

export default ArrowIcon;