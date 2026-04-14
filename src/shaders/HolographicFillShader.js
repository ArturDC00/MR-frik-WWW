import * as THREE from 'three';
import { COLORS } from '../constants/colors';

// ============================================================
// PERFORMANCE DETECTION
// ============================================================
function detectPerformanceTier() {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (cores < 4 || memory < 4 || isMobile) return 'LOW';
    if (cores <= 8 && memory <= 8) return 'MID';
    return 'HIGH';
}

const PERF_TIER = detectPerformanceTier();

// ============================================================
// HOLOGRAPHIC FILL SHADER - Adaptive dot matrix
// ============================================================
export const HolographicFillShader = {
    uniforms: {
        uTime: { value: 0 },
        colorHighlight: { value: new THREE.Color(COLORS.gradientEnd) },
        uOpacity: { value: 0.0 }
    },
    vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        uniform float uTime;

        void main() {
            vNormal = normal;
            
            ${PERF_TIER !== 'LOW' ? `
                // ✅ MID/HIGH: Breathing displacement
                float breathe = sin(uTime * 1.0) * 0.5 + 0.5;
                float displacement = breathe * 0.8;
                vec3 newPosition = position + normal * displacement;
                vPosition = newPosition;
            ` : `
                // ✅ LOW: No displacement
                vPosition = position;
            `}
            
            vec4 worldPos = modelMatrix * vec4(vPosition, 1.0);
            vWorldPosition = worldPos.xyz;
            
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
    `,
    fragmentShader: PERF_TIER === 'LOW'
        ? `
            // ✅ LOW: Simple dots, no scanline
            uniform vec3 colorHighlight;
            uniform float uOpacity;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;

            void main() {
                // Simple dot matrix
                float density = 200.0;
                float pattern = sin(vWorldPosition.x * density) * sin(vWorldPosition.y * density);
                float dots = step(0.95, pattern);

                // Fresnel
                vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

                vec3 finalColor = colorHighlight + vec3(1.0) * dots;
                float alpha = uOpacity * (dots * 0.8 + fresnel * 0.2);

                if (alpha < 0.05) discard;
                gl_FragColor = vec4(finalColor, alpha);
            }
        `
        : `
            // ✅ MID/HIGH: High quality dots + scanline + fresnel
            uniform float uTime;
            uniform vec3 colorHighlight;
            uniform float uOpacity;
            
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;

            void main() {
                float density = 300.0;
                float pattern = 
                    sin(vWorldPosition.x * density) * 
                    sin(vWorldPosition.y * density) * 
                    sin(vWorldPosition.z * density);
                
                float dots = smoothstep(0.98, 1.0, pattern);

                // Scanline
                float scan = sin(vWorldPosition.y * 2.0 - uTime * 2.0) * 0.5 + 0.5;
                float scanBeam = smoothstep(0.9, 1.0, scan) * 0.8;

                // Fresnel
                vec3 viewDir = normalize(cameraPosition - vPosition);
                float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

                vec3 finalColor = colorHighlight + vec3(1.0) * dots * 2.0;
                float visibility = dots + (fresnel * 0.3) + (scanBeam * 0.2);
                float alpha = uOpacity * visibility;

                if (alpha < 0.05) discard;
                gl_FragColor = vec4(finalColor, alpha);
            }
        `
};