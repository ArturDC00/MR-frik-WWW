import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ALL_ROUTES } from '../../constants/routes';
import { latLngToVector3 } from '../../utils/math';
import { GLOBE_RADIUS } from '../../constants/config';

// Quality presets for routes
const ROUTE_QUALITY = {
    LOW: {
        tubeSegments: 32,        // Mniej segmentów krzywej
        tubeRadius: 0.2,         // Cieńsza rura
        radialSegments: 4,       // Mniej segmentów okręgu
        enableGlow: false,
        updateFrequency: 2,      // Co 2 frames
    },
    MID: {
        tubeSegments: 64,
        tubeRadius: 0.25,
        radialSegments: 6,
        enableGlow: true,
        updateFrequency: 1,
    },
    HIGH: {
        tubeSegments: 100,
        tubeRadius: 0.3,
        radialSegments: 8,
        enableGlow: true,
        updateFrequency: 1,
    }
};

// ============================================================
// OPTIMIZED ANIMATED ROUTES - Instanced + LOD
// ============================================================
export function AnimatedRoutes({ show, perfTier }) {
    const meshRefs = useRef([]);
    const quality = ROUTE_QUALITY[perfTier] ?? ROUTE_QUALITY.MID;

    // Generate route geometries ONCE with LOD
    const routes = useMemo(() => {
        const result = ALL_ROUTES.map((route, idx) => {
            const start = latLngToVector3(route.from.lat, route.from.lng, GLOBE_RADIUS + 0.5);
            const end = latLngToVector3(route.to.lat, route.to.lng, GLOBE_RADIUS + 0.5);

            // Higher arc for flight effect
            const mid = new THREE.Vector3()
                .addVectors(start, end)
                .multiplyScalar(0.5)
                .normalize()
                .multiplyScalar(GLOBE_RADIUS + 20);

            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

            // ✅ ADAPTIVE QUALITY - Less geometry on LOW
            const tubeGeometry = new THREE.TubeGeometry(
                curve,
                quality.tubeSegments,      // 32 vs 100
                quality.tubeRadius,        // 0.2 vs 0.3
                quality.radialSegments,    // 4 vs 8
                false
            );

            // Optimized shader - simplified calculations
            const shaderMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    colorStart: { value: new THREE.Color('#102044') },
                    colorEnd: { value: new THREE.Color('#FD9731') },
                    uSpeed: { value: 0.3 },
                    uGlowIntensity: { value: quality.enableGlow ? 1.2 : 0.6 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float uTime;
                    uniform vec3 colorStart;
                    uniform vec3 colorEnd;
                    uniform float uSpeed;
                    uniform float uGlowIntensity;
                    varying vec2 vUv;
                    
                    void main() {
                        // Gradient
                        vec3 color = mix(colorStart, colorEnd, vUv.x);
                        
                        // Animated "plane" - light moving along path
                        float plane = fract(vUv.x - uTime * uSpeed);
                        
                        // ✅ OPTIMIZED: Simplified smoothstep calculation
                        float planeGlow = step(0.9, plane) * (1.0 - step(1.0, plane));
                        
                        // Add brightness where "plane" is
                        color += vec3(1.0, 0.9, 0.8) * planeGlow * uGlowIntensity;
                        
                        // ✅ OPTIMIZED: Static pulse removed on LOW (saves sin() calculation)
                        float pulse = ${perfTier === 'LOW' ? '0.85' : 'sin(uTime * 2.0) * 0.15 + 0.85'};
                        float alpha = pulse * (0.8 + planeGlow * 0.2);
                        
                        gl_FragColor = vec4(color, alpha);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            // Cleanup function
            return {
                geometry: tubeGeometry,
                material: shaderMaterial,
                cleanup: () => {
                    tubeGeometry.dispose();
                    shaderMaterial.dispose();
                }
            };
        });

        return result;
    }, [perfTier, quality.tubeSegments, quality.tubeRadius, quality.radialSegments, quality.enableGlow]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            routes.forEach(route => route.cleanup());
        };
    }, [routes]);

    // Throttled animation update
    const frameCount = useRef(0);
    useFrame((state) => {
        if (!show) return;

        frameCount.current++;
        if (frameCount.current % quality.updateFrequency !== 0) return;

        const time = state.clock.elapsedTime;

        // Update all route shaders
        meshRefs.current.forEach((mesh) => {
            if (mesh?.material?.uniforms) {
                mesh.material.uniforms.uTime.value = time;
            }
        });
    });

    if (!show) return null;

    return (
        <group name="animated-routes" frustumCulled={true}>
            {routes.map((route, index) => (
                <mesh
                    key={index}
                    ref={el => meshRefs.current[index] = el}
                    geometry={route.geometry}
                    material={route.material}
                    frustumCulled={true}
                />
            ))}
        </group>
    );
}