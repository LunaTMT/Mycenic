import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path'; // ✅ Import path

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
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            '@utils': path.resolve(__dirname, 'resources/js/utils'), // ✅ Add this line
        },
    },
    server: {
        host: 'localhost',
        port: 5174,
        cors: true,
    },
});
