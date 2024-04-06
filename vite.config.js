import { defineConfig } from 'vite'


// vite.config.js
export default defineConfig({
    // Other Vite configurations...
    optimizeDeps: {
        include: ['firebase-messaging-sw.js'], // Include the service worker script
    },
    // Additional Vite configurations...
});