import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '../../utils/math';
import { WROCLAW_COORDS, GLOBE_RADIUS } from '../../constants/config';
import { detectDeviceType, CAMERA_POSITIONS } from '../../utils/rwd-config';

const INTRO_DURATION_DESKTOP = 5.5;
const INTRO_DURATION_MOBILE  = 2.0;

const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

const INTRO_DURATION = isMobileDevice() ? INTRO_DURATION_MOBILE : INTRO_DURATION_DESKTOP;

const CAMERA_SETTINGS = {
    LOW: {
        lerpSpeed: 2.0,          // Faster lerp = less smooth but better performance
        updateFrequency: 2,      // Update every 2 frames
        useBezier: false,        // Linear interpolation only
    },
    MID: {
        lerpSpeed: 2.5,
        updateFrequency: 1,
        useBezier: true,
    },
    HIGH: {
        lerpSpeed: 3.0,
        updateFrequency: 1,
        useBezier: true,         // Smooth bezier curves
    }
};

// Stany kamery:
// INIT    → czeka na załadowanie
// INTRO   → animacja startowa (Wrocław → USA)
// IDLE    → ScrollytellingController przejmuje kontrolę
// FOCUSED → użytkownik kliknął kraj/port

export function CameraController({ isLoaded, target, onIntroComplete, perfTier = 'MID' }) {
    const { camera } = useThree();
    const state = useRef('INIT');
    const time = useRef(0);
    const lastFocusPos = useRef(null);
    const lastTarget = useRef(null);
    const frameCount = useRef(0);

    const settings = CAMERA_SETTINGS[perfTier];

    // ✅ RWD: Device detection
    const [deviceType, setDeviceType] = useState(() => detectDeviceType());

    // ✅ RWD: Responsive camera positions
    const cameraConfig = CAMERA_POSITIONS[deviceType];

    // ✅ RWD: Update device type on resize
    useEffect(() => {
        const handleResize = () => {
            const newDeviceType = detectDeviceType();
            if (newDeviceType !== deviceType) {
                setDeviceType(newDeviceType);
                // Update camera FOV
                camera.fov = cameraConfig.hero.fov;
                camera.updateProjectionMatrix();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [deviceType, camera, cameraConfig]);

    const startPos = useMemo(() =>
        latLngToVector3(WROCLAW_COORDS.lat, WROCLAW_COORDS.lng, GLOBE_RADIUS + 0.5), []);

    const midPos = useMemo(() =>
        latLngToVector3(45.0, -30.0, GLOBE_RADIUS + 70.0), []);

    // ✅ RWD: Adaptive end position based on device
    const endPos = useMemo(() => {
        const pos = cameraConfig.hero.position;
        return new THREE.Vector3(pos[0], pos[1], pos[2]);
    }, [cameraConfig]);

    useFrame((_, delta) => {
        // ✅ Throttle updates on LOW
        frameCount.current++;
        if (frameCount.current % settings.updateFrequency !== 0) return;

        // ── INIT ──────────────────────────────────────────────
        if (!isLoaded || state.current === 'INIT') {
            camera.position.copy(startPos);
            camera.lookAt(0, 0, 0);
            if (isLoaded) state.current = 'INTRO';
            return;
        }

        // ── INTRO ─────────────────────────────────────────────
        if (state.current === 'INTRO') {
            time.current += delta;
            const progress = Math.min(time.current / INTRO_DURATION, 1);

            if (settings.useBezier) {
                // ✅ HIGH/MID: Smooth cubic easing
                const t = progress < 0.5
                    ? 4 * progress * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                const invT = 1 - t;
                const p0 = startPos, p1 = midPos, p2 = endPos;

                // Quadratic Bezier
                camera.position.x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x;
                camera.position.y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y;
                camera.position.z = invT * invT * p0.z + 2 * invT * t * p1.z + t * t * p2.z;
            } else {
                // ✅ LOW: Simple linear interpolation (faster)
                camera.position.lerpVectors(startPos, endPos, progress);
            }

            camera.lookAt(0, 0, 0);

            if (progress >= 1) {
                state.current = 'IDLE';
                onIntroComplete();
            }
            return;
        }

        // ── IDLE ──────────────────────────────────────────────
        // Nie wywołuj lookAt(0,0,0) w pętli — po wyłączeniu OrbitControls (np. lekki scroll)
        // wymuszanie lookAt „szarpało” kamerę z powrotem ku domyślnemu kadrowi (USA/środek).
        // Zachowujemy pozę z OrbitControls / po powrocie z fokusu; intro i FOCUSED ustawiają kadr osobno.
        if (state.current === 'IDLE' && !target) {
            return;
        }

        // ── FOCUSED ───────────────────────────────────────────
        if (target) {
            const targetChanged = !lastTarget.current || !lastTarget.current.equals(target);
            if (targetChanged) lastTarget.current = target.clone();
            state.current = 'FOCUSED';

            const direction = target.clone().normalize();
            const zoomDistance = GLOBE_RADIUS + 18;
            const frontPos = direction.clone().multiplyScalar(zoomDistance);

            const upVector = new THREE.Vector3(0, 1, 0);
            const rightVector = new THREE.Vector3();
            rightVector.crossVectors(upVector, direction).normalize();
            const finalPos = frontPos.clone().add(rightVector.multiplyScalar(5));

            // ✅ Adaptive lerp speed
            const lerpFactor = delta * (targetChanged ? settings.lerpSpeed : settings.lerpSpeed * 0.7);
            camera.position.lerp(finalPos, lerpFactor);
            camera.lookAt(0, 0, 0);
            lastFocusPos.current = finalPos.clone();
            return;
        }

        // ── KONIEC FOKUSU (zamknięcie panelu) ─────────────────
        // Zostawiamy kamerę przy kraju — powrót do preFocusPos walczył z OrbitControls
        // (włączenie orbit w tej samej klatce co lerp) i dawało wrażenie „skoku” / starej pozycji.
        if (state.current === 'FOCUSED' && !target) {
            state.current = 'IDLE';
            lastFocusPos.current = null;
            lastTarget.current = null;
        }
    });

    return null;
}