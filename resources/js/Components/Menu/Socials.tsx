import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Socials() {
    return (
        <>
            <a 
                href="https://www.instagram.com/mycenic/" 
                target="_blank" 
                rel="noopener noreferrer"
            >
                <FaSquareInstagram 
                    className="w-10 h-10  rounded-md text-gray-800 dark:text-white hover:filter hover:brightness-125 transition-all" 
                />
            </a>

        </>
    );
}
