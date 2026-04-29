import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // R3F/GSAP nie lubią strict mode (double-invoke effects)

    experimental: {
        // Mniejsze importy z barrel files — mniej kodu w bundlu klienta (TBT)
        optimizePackageImports: ['framer-motion', '@react-three/drei'],
    },

    // Naprawia ostrzeżenie o wielu lockfiles w workspace
    outputFileTracingRoot: __dirname,

    // ESLint — wyłącz podczas builda (projekt używa R3F/Three.js które kolidują z
    // react-hooks/purity i react-hooks/immutability; lint uruchamiamy osobno)
    eslint: { ignoreDuringBuilds: true },

    // GLB/GLTF i inne statyczne assety
    webpack(config) {
        config.module.rules.push({
            test: /\.(glb|gltf)$/,
            type: 'asset/resource',
        });
        return config;
    },

    // Zewnętrzne obrazy (np. Unsplash w DreamSection)
    images: {
        qualities: [75, 90, 100],
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],
    },

    // Three.js i powiązane paczki muszą być transpilowane przez Next.js
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],

    // Security headers — Lighthouse Best Practices + OWASP
    // HSTS tylko gdy ENABLE_HSTS=true (wdrożenie za prawdziwym HTTPS). Na samym HTTP
    // (np. IP serwera) nagłówek HSTS psuje ładowanie CSS/JS — przeglądarka wymusza https://.
    async headers() {
        const baseSecurity = [
            { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            { key: 'X-XSS-Protection', value: '1; mode=block' },
        ];
        if (process.env.ENABLE_HSTS === 'true') {
            baseSecurity.push({
                key: 'Strict-Transport-Security',
                value: 'max-age=31536000; includeSubDomains; preload',
            });
        }
        return [
            {
                source: '/(.*)',
                headers: baseSecurity,
            },
            {
                // Statyczne assety — długi cache
                source: '/Photo/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/fonts/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/models/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ];
    },
};

export default nextConfig;
