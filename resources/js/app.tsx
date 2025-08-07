import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { NavProvider } from './Contexts/Layout/NavContext';
import { DarkModeProvider } from './Contexts/Layout/DarkModeContext';
import { CartProvider } from './Contexts/Shop/Cart/CartContext';
import { ShippingProvider } from './Contexts/Shop/Cart/ShippingContext';

import { GoogleOAuthProvider } from '@react-oauth/google';
import Lenis from 'lenis';

import { Inertia } from '@inertiajs/inertia';

// 🆕 Import QuestionsProvider
import { QuestionsProvider } from './Contexts/Shop/Items/QuestionsContext';

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
                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                        <CartProvider>
                            <ShippingProvider>
                                
                             
                                    <App {...props} />
                           
                            </ShippingProvider>
                        </CartProvider>
                    </GoogleOAuthProvider>
                </NavProvider>
            </DarkModeProvider>
        );

        Inertia.on('navigate', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },
});
