import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '../../utils/math';
import { WROCLAW_COORDS, GLOBE_RADIUS } from '../../constants/config';
import { detectDeviceType, CAMERA_POSITIONS } from '../../utils/rwd-config';

const INTRO_DURATION_DESKTOP = 5.5;
const INTRO_DURATION_MOBILE  = 2.0;

/** Czas powrotu do widoku ogólnego po zamknięciu panelu kraju (s). */
const RETURN_DURATION = 1.2;

const _fromDir = new THREE.Vector3();
const _toDir = new THREE.Vector3();
const _arcRotation = new THREE.Quaternion();
const _arcStep = new THREE.Quaternion();

/**
 * Punkt między `from` a `to` po ŁUKU wokół środka globusa: kierunek interpolowany sferycznie,
 * odległość liniowo. Wcześniej kamera szła prostą linią (`position.lerp`) — między krajami po
 * różnych stronach kuli (np. USA → Polska) taka prosta przechodzi przez globus i kamera w niego
 * wlatywała. `out` może być tym samym obiektem co `from` (najpierw odczyt, potem zapis).
 */
function arcLerp(from, to, t, out) {
    const fromLen = from.length();
    const toLen = to.length();
    _fromDir.copy(from).divideScalar(fromLen || 1);
    _toDir.copy(to).divideScalar(toLen || 1);
    _arcRotation.setFromUnitVectors(_fromDir, _toDir);
    _arcStep.identity().slerp(_arcRotation, t);
    return out.copy(_fromDir).applyQuaternion(_arcStep).multiplyScalar(fromLen + (toLen - fromLen) * t);
}

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
// RETURNING → panel zamknięty, kamera wraca po łuku do odległości i wysokości kadru hero

/**
 * `onBusyChange(busy)` — true, gdy kamera leci do kraju lub wraca do widoku ogólnego. WebGLCanvas
 * wyłącza wtedy OrbitControls, żeby nie walczyły z animacją (to był powód, dla którego kiedyś
 * usunięto powrót po zamknięciu panelu). Wołane tylko przy zmianie stanu, nie co klatkę.
 */
export function CameraController({ isLoaded, target, onIntroComplete, onBusyChange, perfTier = 'MID' }) {
    const { camera, invalidate } = useThree();
    const state = useRef('INIT');
    const busyRef = useRef(false);
    const returnTime = useRef(0);
    const returnFrom = useRef(new THREE.Vector3());
    const returnTo = useRef(new THREE.Vector3());
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
        const throttled = frameCount.current % settings.updateFrequency !== 0;

        // ── INIT ──────────────────────────────────────────────
        if (!isLoaded || state.current === 'INIT') {
            if (throttled) return;
            camera.position.copy(startPos);
            camera.lookAt(0, 0, 0);
            if (isLoaded) state.current = 'INTRO';
            return;
        }

        // ── INTRO ─────────────────────────────────────────────
        if (state.current === 'INTRO') {
            // ⚠️ Zegar intro musi tykać w KAŻDEJ klatce. `delta` z fibera liczone jest raz na
            // wyrenderowaną klatkę, więc akumulowanie go tylko na co drugiej (LOW: updateFrequency 2)
            // rozciągało intro dokładnie 2x: iPhone 2.0 s → ~4.0 s, LOW/reduced-motion desktop 5.5 s → ~11 s.
            time.current += delta;
            const progress = Math.min(time.current / INTRO_DURATION, 1);

            // Throttlujemy sam zapis pozycji, ale ostatnią klatkę (progress === 1) zapisujemy zawsze —
            // inaczej kamera kończy o 0.3-0.8% przed endPos, IDLE jej już nie tyka, a OrbitControls
            // montuje się z tą pozą: trwałe, lekkie przekrzywienie kadru hero.
            if (throttled && progress < 1) return;

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

        const setBusy = (busy) => {
            if (busyRef.current === busy) return;
            busyRef.current = busy;
            onBusyChange?.(busy);
        };

        // ── RETURNING — powrót do widoku ogólnego po zamknięciu panelu ──
        // Przed throttlingiem: zegar animacji musi tykać co klatkę (ten sam błąd co kiedyś w INTRO
        // rozciągałby powrót 2x na LOW). Klik w inny kraj w trakcie powrotu przerywa go (target != null).
        if (state.current === 'RETURNING' && !target) {
            returnTime.current += delta;
            const p = Math.min(returnTime.current / RETURN_DURATION, 1);
            const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            arcLerp(returnFrom.current, returnTo.current, eased, camera.position);
            camera.lookAt(0, 0, 0);
            if (p >= 1) {
                state.current = 'IDLE';
                setBusy(false);
            } else {
                invalidate();
            }
            return;
        }

        // Poniżej (IDLE / FOCUSED) throttle działa jak wcześniej — to dojazd do celu, nie zegar,
        // więc pominięta klatka tylko zwalnia dojazd, nie zmienia jego długości.
        if (throttled) return;

        // ── IDLE ──────────────────────────────────────────────
        // Nie wywołuj lookAt(0,0,0) w pętli — po wyłączeniu OrbitControls (np. lekki scroll)
        // wymuszanie lookAt „szarpało” kamerę z powrotem ku domyślnemu kadrowi (USA/środek).
        if (state.current === 'IDLE' && !target) {
            return;
        }

        // ── FOCUSED ───────────────────────────────────────────
        if (target) {
            // `target` przychodzi z App jako zwykłe {x,y,z} w układzie ŚWIATA (App uwzględnia już
            // obrót globusa). App nie importuje three — konwersja jest tutaj, na granicy.
            const prev = lastTarget.current;
            const targetChanged =
                !prev || prev.x !== target.x || prev.y !== target.y || prev.z !== target.z;
            if (targetChanged) lastTarget.current = { x: target.x, y: target.y, z: target.z };
            state.current = 'FOCUSED';
            setBusy(true);

            const direction = new THREE.Vector3(target.x, target.y, target.z).normalize();
            const zoomDistance = GLOBE_RADIUS + 18;
            const frontPos = direction.clone().multiplyScalar(zoomDistance);

            const upVector = new THREE.Vector3(0, 1, 0);
            const rightVector = new THREE.Vector3();
            rightVector.crossVectors(upVector, direction).normalize();
            const finalPos = frontPos.clone().add(rightVector.multiplyScalar(5));

            // ✅ Adaptive lerp speed — ten sam wykładniczy dojazd co wcześniej, ale po łuku wokół kuli
            const lerpFactor = Math.min(1, delta * (targetChanged ? settings.lerpSpeed : settings.lerpSpeed * 0.7));
            arcLerp(camera.position, finalPos, lerpFactor, camera.position);
            camera.lookAt(0, 0, 0);
            lastFocusPos.current = finalPos.clone();
            invalidate();
            return;
        }

        // ── KONIEC FOKUSU (zamknięcie panelu) → powrót do widoku ogólnego ───────────
        // Ta sama odległość i wysokość co po intro (kadr hero), ale ZWRÓCONA w stronę regionu, który
        // użytkownik właśnie oglądał — po zamknięciu Polski sąsiednie Niemcy i Holandia zostają w kadrze,
        // zamiast za każdym razem wracać na stronę Ameryki. OrbitControls są wyłączone do końca powrotu.
        if (state.current === 'FOCUSED' && !target) {
            const heroDistance = endPos.length();
            const heroElevation = Math.asin(THREE.MathUtils.clamp(endPos.y / heroDistance, -1, 1));
            const azimuth = Math.atan2(camera.position.x, camera.position.z);
            returnFrom.current.copy(camera.position);
            returnTo.current.set(
                Math.sin(azimuth) * Math.cos(heroElevation),
                Math.sin(heroElevation),
                Math.cos(azimuth) * Math.cos(heroElevation),
            ).multiplyScalar(heroDistance);
            returnTime.current = 0;
            state.current = 'RETURNING';
            lastFocusPos.current = null;
            lastTarget.current = null;
            invalidate();
        }
    });

    return null;
}