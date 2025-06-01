import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import { createRoot } from 'react-dom/client';

import { CartProvider } from '../js/Contexts/CartContext';
import { NavProvider } from '../js/Contexts/NavContext';  
import { DarkModeProvider } from './Contexts/DarkModeContext';

import { GoogleOAuthProvider } from '@react-oauth/google';

import Lenis from 'lenis';

// Import Inertia
import { Inertia } from '@inertiajs/inertia';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize Lenis
const lenis = new Lenis({
    autoRaf: true,
});

createInertiaApp({
    
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
    resolvePageComponent(`./Pages/${name}.tsx`, {
        ...import.meta.glob('./Pages/**/*.tsx'),
    }),

    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <DarkModeProvider>
                <NavProvider>  
                    <CartProvider>  
                        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                                <App {...props} />
                        </GoogleOAuthProvider>
                    </CartProvider>
                </NavProvider>
            </DarkModeProvider> 
        );

        Inertia.on('navigate', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
          
    },
});


//move cart provider closer to component 