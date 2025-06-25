import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the context type
interface NavContextType {
    showNav: boolean;
    setShowNav: React.Dispatch<React.SetStateAction<boolean>>;
    scrollDirection: 'up' | 'down' | null;
    setScrollDirection: React.Dispatch<React.SetStateAction<'up' | 'down' | null>>;
}

// Create the context with default values
const NavContext = createContext<NavContextType | undefined>(undefined);

// Create a provider component
export const NavProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [showNav, setShowNav] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
    const [lastScrollY, setLastScrollY] = useState(0);  // Track last scroll position

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Check scroll direction and update visibility of navigation
            if (currentScrollY < lastScrollY - 5) {
                setScrollDirection('up');
                setShowNav(true);  // Show the nav when scrolling up
            } else if (currentScrollY > lastScrollY + 5) {
                setScrollDirection('down');
                setShowNav(false);  // Hide the nav when scrolling down
            }

            setLastScrollY(currentScrollY);  // Update last scroll position
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);  // Dependency on lastScrollY

    return (
        <NavContext.Provider value={{ showNav, setShowNav, scrollDirection, setScrollDirection }}>
            {children}
        </NavContext.Provider>
    );
};

// Custom hook to use the context easily
export const useNav = () => {
    const context = useContext(NavContext);
    if (!context) {
        throw new Error('useNav must be used within a NavProvider');
    }
    return context;
};
