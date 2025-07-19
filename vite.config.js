import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';  

export default defineConfig({
    plugins: [
        tailwindcss(),  
        laravel({
            input: [
                'resources/js/app.tsx',
                'resources/css/app.css',
            ],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: 'localhost',
        port: 5174,
        cors: true,
    },
});