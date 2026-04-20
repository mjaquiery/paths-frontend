"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://nuxt.com/docs/api/configuration/nuxt-config
exports.default = defineNuxtConfig({
    ssr: false, // static SPA output
    compatibilityDate: '2024-11-01',
    modules: ['@vite-pwa/nuxt'],
    pwa: {
        registerType: 'autoUpdate',
        // Disable auto-injection so the SW is booted explicitly in plugins/pwa.client.ts
        injectRegister: null,
        includeAssets: [
            'favicon.ico',
            'favicon.svg',
            'favicon-32x32.png',
            'apple-touch-icon.png',
        ],
        manifest: {
            name: 'Paths',
            short_name: 'Paths',
            description: 'Your journal, easily shared',
            theme_color: '#3949ab',
            background_color: '#ffffff',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
                {
                    src: '/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: '/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
                {
                    src: '/icon-512x512-maskable.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable',
                },
            ],
        },
        workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            runtimeCaching: [
                {
                    // Cache API responses with NetworkFirst so the app stays
                    // up-to-date when online but can still serve cached data offline.
                    urlPattern: '/v1/.*',
                    handler: 'NetworkFirst',
                    options: {
                        cacheName: 'api-cache',
                        networkTimeoutSeconds: 10,
                        cacheableResponse: { statuses: [0, 200] },
                    },
                },
                {
                    // Cache remote images with CacheFirst for performance.
                    urlPattern: /\.(?:png|jpg|jpeg|webp|gif|svg)$/i,
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'images-cache',
                        expiration: {
                            maxEntries: 200,
                            maxAgeSeconds: 30 * 24 * 60 * 60,
                        },
                        cacheableResponse: { statuses: [0, 200] },
                    },
                },
            ],
        },
    },
    css: [
        '@ionic/vue/css/core.css',
        '@ionic/vue/css/normalize.css',
        '@ionic/vue/css/structure.css',
        '@ionic/vue/css/typography.css',
        '@ionic/vue/css/palettes/dark.class.css',
        '~/src/assets/theme.css',
        '~/src/assets/transitions.css',
        '~/src/assets/design-f.css',
    ],
    app: {
        head: {
            htmlAttrs: { lang: 'en', class: 'ion-palette-dark' },
            meta: [
                { charset: 'UTF-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
                {
                    name: 'apple-mobile-web-app-capable',
                    content: 'yes',
                },
                {
                    name: 'apple-mobile-web-app-status-bar-style',
                    content: 'default',
                },
                { name: 'apple-mobile-web-app-title', content: 'Paths' },
                { name: 'theme-color', content: '#3949ab' },
            ],
            link: [
                {
                    rel: 'icon',
                    type: 'image/svg+xml',
                    sizes: 'any',
                    href: '/favicon.svg',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '32x32',
                    href: '/favicon-32x32.png',
                },
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
            ],
            title: 'Paths',
        },
    },
    vite: {
        test: {
            environment: 'jsdom',
        },
    },
    typescript: {
        strict: true,
    },
});
