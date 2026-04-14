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
// DEPTH ABYSS SHADER - Adaptive star field complexity
// ============================================================
export const DepthAbyssShader = {
    uniforms: {
        uTime: { value: 0 },
        colorStart: { value: new THREE.Color(COLORS.gradientStart) },
        colorEnd: { value: new THREE.Color(COLORS.gradientEnd) }
    },
    vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: PERF_TIER === 'LOW'
        ? `
            // ✅ LOW: No stars, simple gradient + wave
            uniform float uTime;
            uniform vec3 colorStart;
            uniform vec3 colorEnd;
            varying vec3 vPosition;
            
            void main() {
                float depth = length(vPosition) / 32.0;
                float wave = sin(depth * 10.0 - uTime * 2.0) * 0.5 + 0.5;
                
                vec3 color = mix(colorStart, colorEnd, depth * 0.8 + wave * 0.2);
                float alpha = (0.18 + wave * 0.12) * (1.0 - depth * 0.4);
                
                gl_FragColor = vec4(color, alpha);
            }
        `
        : PERF_TIER === 'MID'
            ? `
            // ✅ MID: Reduced stars (2 layers)
            uniform float uTime;
            uniform vec3 colorStart;
            uniform vec3 colorEnd;
            varying vec3 vPosition;
            
            float hash(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }
            
            void main() {
                float depth = length(vPosition) / 32.0;
                vec3 starPos = vPosition * 12.0;
                starPos.z += uTime * 0.3;
                
                float stars = 0.0;
                // Only 2 layers instead of 4
                for(int i = 0; i < 2; i++) {
                    vec3 layer = starPos * (0.8 + float(i) * 0.4);
                    float h = hash(floor(layer));
                    if(h > 0.97) {
                        float twinkle = sin(uTime * 3.0 + h * 20.0) * 0.5 + 0.5;
                        stars += twinkle * (1.0 - float(i) * 0.25);
                    }
                }
                
                float wave = sin(depth * 10.0 - uTime * 2.0) * 0.5 + 0.5;
                float pulse = sin(uTime * 1.5) * 0.5 + 0.5;
                vec3 color = mix(colorStart, colorEnd, depth * 0.8 + wave * 0.2);
                color += vec3(1.0, 0.95, 0.8) * stars * 0.7;
                float alpha = (0.18 + wave * 0.12 + stars * 0.25) * (1.0 - depth * 0.4);
                
                gl_FragColor = vec4(color * (1.3 + pulse * 0.3), alpha);
            }
        `
            : `
            // ✅ HIGH: Full quality (4 star layers)
            uniform float uTime;
            uniform vec3 colorStart;
            uniform vec3 colorEnd;
            varying vec3 vPosition;
            varying vec3 vNormal;
            
            float hash(vec3 p) {
                p = fract(p * 0.3183099 + 0.1);
                p *= 17.0;
                return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }
            
            void main() {
                float depth = length(vPosition) / 32.0;
                vec3 starPos = vPosition * 12.0;
                starPos.z += uTime * 0.3;
                
                float stars = 0.0;
                // Full 4 layers
                for(int i = 0; i < 4; i++) {
                    vec3 layer = starPos * (0.8 + float(i) * 0.4);
                    float h = hash(floor(layer));
                    if(h > 0.97) {
                        float twinkle = sin(uTime * 3.0 + h * 20.0) * 0.5 + 0.5;
                        stars += twinkle * (1.0 - float(i) * 0.25);
                    }
                }
                
                float wave = sin(depth * 10.0 - uTime * 2.0) * 0.5 + 0.5;
                float pulse = sin(uTime * 1.5) * 0.5 + 0.5;
                vec3 color = mix(colorStart, colorEnd, depth * 0.8 + wave * 0.2);
                color += vec3(1.0, 0.95, 0.8) * stars * 0.7;
                float alpha = (0.18 + wave * 0.12 + stars * 0.25) * (1.0 - depth * 0.4);
                
                gl_FragColor = vec4(color * (1.3 + pulse * 0.3), alpha);
            }
        `
};

