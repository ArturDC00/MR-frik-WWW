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
// ATMOSPHERE SHADER - Simplified on LOW
// ============================================================
export const AtmosphereShader = {
    uniforms: {
        colorStart: { value: new THREE.Color('#000000') },
        colorEnd: { value: new THREE.Color(COLORS.gradientEnd) },
        viewVector: { value: new THREE.Vector3(0, 0, 1) }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: PERF_TIER === 'LOW'
        ? `
            // LOW: Rim light — max() zapobiega pow(ujemna, ...) = NaN
            uniform vec3 colorEnd;
            varying vec3 vNormal;

            void main() {
                float rim = max(0.0, 0.6 - dot(vNormal, vec3(0, 0, 1.0)));
                float intensity = pow(rim, 3.0) * 0.4;
                gl_FragColor = vec4(colorEnd, 1.0) * intensity;
            }
        `
        : `
            // MID/HIGH: Enhanced rim light — max() zapobiega NaN
            uniform vec3 colorEnd;
            varying vec3 vNormal;

            void main() {
                float rim = max(0.0, 0.6 - dot(vNormal, vec3(0, 0, 1.0)));
                float intensity = pow(rim, 4.5) * 0.6;
                vec3 atmosphereColor = colorEnd;
                gl_FragColor = vec4(atmosphereColor, 1.0) * intensity;
            }
        `
};

