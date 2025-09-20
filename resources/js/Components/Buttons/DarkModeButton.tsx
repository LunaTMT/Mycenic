import { DarkModeSwitch } from 'react-toggle-dark-mode';

interface DarkModeToggleProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const DarkModeToggle = ({ darkMode, toggleDarkMode }: DarkModeToggleProps) => {
    return (
        <button
            onClick={toggleDarkMode}
            className="w-14 h-12 text-black hover:rotate-[-30deg] transition-transform duration-500 focus:outline-none"
        >
            {darkMode ? <span className="text-3xl">🌙</span> : <span className="text-3xl">☀️</span>}
        </button>
    );
};

export default DarkModeToggle;
