import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, // R3F/GSAP nie lubią strict mode (double-invoke effects)

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
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    // Zapobiega clickjacking (iframe embedding)
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    // Zapobiega MIME sniffing
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    // Referrer dla prywatności
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    // Blokuje niebezpieczne permisje przeglądarki
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    // Wymusza HTTPS przez rok (Strict-Transport-Security)
                    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
                    // XSS Protection (legacy, ale Lighthouse to sprawdza)
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                ],
            },
            {
                // Statyczne assety — długi cache
                source: '/Photo/(.*)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ];
    },
};

export default nextConfig;
