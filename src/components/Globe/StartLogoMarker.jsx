import React, { useRef, useMemo, useState } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '../../utils/math';
import { WROCLAW_COORDS, GLOBE_RADIUS, LOGO_PATH } from '../../constants/config';

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

// Logo PNG: 3508×2481px — aspect ratio ~1.414 (szersze niż wyższe)
const LOGO_ASPECT = 3508 / 2481;

const LOGO_SETTINGS = {
    LOW: {
        updateFrequency: 3,      // Update every 3 frames
        enableSmoothing: false,  // No smoothstep calculations
        minOpacity: 0.1,         // Higher threshold for early discard
    },
    MID: {
        updateFrequency: 2,
        enableSmoothing: true,
        minOpacity: 0.05,
    },
    HIGH: {
        updateFrequency: 1,
        enableSmoothing: true,
        minOpacity: 0.01,
    }
};

export function StartLogoMarker() {
    const texture = useTexture(LOGO_PATH);
    const spriteRef = useRef();
    const { camera } = useThree();

    const [perfTier] = useState(() => detectPerformanceTier());
    const settings = LOGO_SETTINGS[perfTier];

    // Position slightly above surface
    const pos = useMemo(() =>
        latLngToVector3(WROCLAW_COORDS.lat, WROCLAW_COORDS.lng, GLOBE_RADIUS + 0.05),
        []);

    // Throttled animation frame
    const frameCount = useRef(0);
    const lastOpacity = useRef(1);
    const lastScale = useRef(0.4);

    useFrame((state) => {
        frameCount.current++;
        if (frameCount.current % settings.updateFrequency !== 0) return;

        if (!spriteRef.current) return;

        const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));

        // ✅ Opacity calculation (adaptive smoothness)
        let opacity;
        if (settings.enableSmoothing) {
            // MID/HIGH: Smooth fade
            opacity = 1.0 - THREE.MathUtils.smoothstep(dist, 35.0, 45.0);
        } else {
            // LOW: Linear fade (faster)
            opacity = 1.0 - Math.max(0, Math.min(1, (dist - 35.0) / 10.0));
        }

        // Early discard optimization
        if (opacity < settings.minOpacity) {
            spriteRef.current.visible = false;
            return;
        }

        spriteRef.current.visible = true;
        spriteRef.current.material.opacity = opacity;

        // ✅ Scale calculation (adaptive smoothness)
        let scale;
        if (settings.enableSmoothing) {
            scale = THREE.MathUtils.lerp(0.4, 2.5, (dist - 32.5) / 10);
        } else {
            scale = 0.4 + ((dist - 32.5) / 10) * 2.1;
        }

        spriteRef.current.scale.set(scale * LOGO_ASPECT, scale, 1);

        // Cache for next frame
        lastOpacity.current = opacity;
        lastScale.current = scale;
    });

    return (
        <sprite ref={spriteRef} position={pos}>
            <spriteMaterial
                map={texture}
                transparent={true}
                depthTest={false}
                depthWrite={false}
                toneMapped={false}
            />
        </sprite>
    );
}