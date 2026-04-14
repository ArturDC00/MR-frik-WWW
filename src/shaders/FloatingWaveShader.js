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
// FLOATING WAVE SHADER - Adaptive wave complexity
// ============================================================
export const FloatingWaveShader = {
    uniforms: {
        uTime: { value: 0 },
        colorMain: { value: new THREE.Color(COLORS.gradientEnd) },
        uDepth: { value: 0.0 }
    },
    vertexShader: PERF_TIER === 'LOW'
        ? `
            // ✅ LOW: Single wave, simplified
            uniform float uTime;
            varying vec3 vPos;
            varying float vWave;
            
            void main() {
                vPos = position;
                // Single wave only
                float wave = sin(position.y * 2.0 + uTime * 2.0) * 0.4;
                vWave = wave;
                
                vec3 direction = normalize(position);
                vec3 animated = position + direction * vWave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(animated, 1.0);
            }
        `
        : `
            // ✅ MID/HIGH: Triple wave layers
            uniform float uTime;
            varying vec3 vPos;
            varying float vWave;
            
            void main() {
                vPos = position;
                float wave1 = sin(position.x * 2.0 + uTime * 2.0) * 0.4;
                float wave2 = cos(position.y * 1.5 + uTime * 1.8) * 0.3;
                float wave3 = sin(position.z * 1.8 + uTime * 1.5) * 0.25;
                vWave = wave1 + wave2 + wave3;
                
                vec3 direction = normalize(position);
                vec3 animated = position + direction * vWave;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(animated, 1.0);
            }
        `,
    fragmentShader: PERF_TIER === 'LOW'
        ? `
            // ✅ LOW: No sparks, simple color
            uniform vec3 colorMain;
            uniform float uDepth;
            varying vec3 vPos;
            varying float vWave;
            
            void main() {
                float depthFade = 1.0 - uDepth;
                float wavePulse = (vWave + 1.0) * 0.5;
                vec3 glowColor = colorMain * (1.2 + wavePulse * 0.4) * depthFade;
                float alpha = depthFade * (0.75 + wavePulse * 0.15);
                
                gl_FragColor = vec4(glowColor, alpha);
            }
        `
        : `
            // ✅ MID/HIGH: Full sparks + complex calculations
            uniform float uTime;
            uniform vec3 colorMain;
            uniform float uDepth;
            varying vec3 vPos;
            varying float vWave;
            
            void main() {
                float spark1 = sin(vPos.x * 10.0 + uTime * 5.0) * 0.5 + 0.5;
                float spark2 = cos(vPos.y * 8.0 - uTime * 4.5) * 0.5 + 0.5;
                float spark3 = sin(length(vPos.xz) * 6.0 + uTime * 3.0) * 0.5 + 0.5;
                float sparkCombined = (spark1 + spark2 + spark3) / 3.0;
                
                float depthFade = 1.0 - uDepth;
                float wavePulse = (vWave + 1.0) * 0.5;
                vec3 glowColor = colorMain * (1.3 + sparkCombined * 0.9 + wavePulse * 0.6) * depthFade;
                float alpha = depthFade * (0.88 + wavePulse * 0.12 + sparkCombined * 0.08);
                
                gl_FragColor = vec4(glowColor, alpha);
            }
        `
};

