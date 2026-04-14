import * as THREE from 'three';

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
// GRADIENT LINE SHADER - Adaptive complexity
// ============================================================
export const GradientLineShader = {
    uniforms: {
        uTime: { value: 0 },
        colorStart: { value: new THREE.Color('#102044') },
        colorEnd: { value: new THREE.Color('#FD9731') }
    },
    vertexShader: `
        varying vec3 vPos;
        void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: PERF_TIER === 'LOW'
        ? `
            // ✅ LOW: Simple gradient, no animation
            uniform vec3 colorStart;
            uniform vec3 colorEnd;
            varying vec3 vPos;
            void main() {
                float gradientFactor = (vPos.y / 32.0) * 0.5 + 0.5;
                vec3 finalColor = mix(colorStart, colorEnd, gradientFactor);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `
        : `
            // ✅ MID/HIGH: Gradient + pulse animation
            uniform vec3 colorStart;
            uniform vec3 colorEnd;
            uniform float uTime;
            varying vec3 vPos;
            void main() {
                float gradientFactor = (vPos.y / 32.0) * 0.5 + 0.5;
                float pulse = sin(uTime * 0.5) * 0.1;
                vec3 finalColor = mix(colorStart, colorEnd, gradientFactor + pulse);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `
};