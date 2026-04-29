'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Preload, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { COLORS } from '../../constants/colors';
import { ElegantGlobe } from './ElegantGlobe';
import { CameraController } from './CameraController';

/** Po zamknięciu panelu kraju — kilka invalidate pod rząd, żeby damping OrbitControls odrysował się przy frameloop `demand`. */
function InvalidateAfterFocusClear({ focusPoint }) {
    const invalidate = useThree((s) => s.invalidate);
    const hadFocus = useRef(false);

    useEffect(() => {
        if (focusPoint) {
            hadFocus.current = true;
            return;
        }
        if (!hadFocus.current) return;
        hadFocus.current = false;
        let i = 0;
        const id = setInterval(() => {
            invalidate();
            if (++i >= 10) clearInterval(id);
        }, 20);
        return () => clearInterval(id);
    }, [focusPoint, invalidate]);

    return null;
}

const StableOrbitControls = React.memo(function StableOrbitControls({
    onEnd,
    rotateSpeed = 0.5,
    /** false podczas fokusu na kraj — nie odmontowujemy kontrolek (unik resetu / „skoku” po zamknięciu panelu) */
    enabled = true,
}) {
    return (
        <OrbitControls
            enabled={enabled}
            enableRotate
            enableZoom={false}
            enablePan={false}
            minDistance={50}
            maxDistance={150}
            rotateSpeed={rotateSpeed}
            enableDamping
            dampingFactor={0.08}
            onEnd={onEnd}
        />
    );
});

/**
 * Scroll nie odmontowuje OrbitControls — Lenis + kółko w DevTools podbija scrollProgress;
 * interakcję i tak odcina pointerEvents na kontenerze globusa w App.
 */

/**
 * Cały drzewo R3F — ładowane osobnym chunkiem (next/dynamic w App.jsx).
 */
export default function WebGLCanvas({
    perfTier,
    isLowPerf,
    isHighPerf,
    scrollProgress,
    introDone,
    isLoaded,
    focusPoint,
    onIntroComplete,
    onGlobeEvent,
    onOrbitInteractionEnd,
    activeGeometry,
    hoverGeometry,
    globeRotation,
    globeAutoSpinPaused,
    hasHoverGeometry,
    hasActiveGeometry,
    hasFocusPoint,
}) {
    const pauseAutoRotate =
        globeAutoSpinPaused || hasHoverGeometry || hasActiveGeometry || hasFocusPoint;

    const orbitRotateSpeed = isLowPerf ? 0.65 : 0.5;

    /** `demand` dopiero gdy globus jest mocno zjedzony scrollem — płynniejszy orbit w widocznym hero (Lighthouse vs UX). */
    const frameMode = scrollProgress < 0.68 ? 'always' : 'demand';

    return (
        <Canvas
            style={{ touchAction: 'none' }}
            dpr={isLowPerf ? [0.75, 1] : isHighPerf ? [1, 1.5] : [1, 1.25]}
            frameloop={frameMode}
            gl={{
                antialias: !isLowPerf,
                powerPreference: 'high-performance',
                preserveDrawingBuffer: false,
            }}
            camera={{ position: [0, 15, 80], fov: 42 }}
        >
            <InvalidateAfterFocusClear focusPoint={focusPoint} />

            <CameraController
                isLoaded={isLoaded}
                target={focusPoint}
                onIntroComplete={onIntroComplete}
                perfTier={perfTier}
            />

            <ambientLight intensity={isLowPerf ? 0.4 : 0.15} />
            <pointLight position={[100, 50, 100]} intensity={isLowPerf ? 2.0 : 2.5} color="#ffffff" />
            {!isLowPerf && (
                <>
                    <pointLight position={[-100, 0, 50]} intensity={3.0} color={COLORS.gradientStart} />
                    <pointLight position={[0, 100, -50]} intensity={2.0} color="#ffffff" />
                    {isHighPerf && (
                        <>
                            <pointLight position={[50, -80, 80]} intensity={1.8} color={COLORS.gradientEnd} />
                            <spotLight position={[0, 150, 0]} intensity={2.5} angle={0.5} penumbra={1} color="#4a90e2" />
                            <spotLight position={[-150, -50, 100]} intensity={2.0} angle={0.6} penumbra={0.8} color={COLORS.gradientEnd} />
                        </>
                    )}
                </>
            )}

            <ElegantGlobe
                perfTier={perfTier}
                onSelect={onGlobeEvent}
                onHover={(point, rot, e) => onGlobeEvent('HOVER', { point, rot, event: e })}
                activeGeometry={activeGeometry}
                hoverGeometry={hoverGeometry}
                globeRotation={globeRotation}
                isIntroDone={introDone}
                pauseAutoRotate={pauseAutoRotate}
                enableGeoFetch={isLoaded}
            />

            {introDone && (
                <StableOrbitControls
                    enabled={!focusPoint}
                    onEnd={onOrbitInteractionEnd}
                    rotateSpeed={orbitRotateSpeed}
                />
            )}

            {!isLowPerf && (
                <EffectComposer disableNormalPass multisampling={0}>
                    <Bloom
                        luminanceThreshold={0.1}
                        mipmapBlur
                        intensity={isHighPerf ? 0.8 : 0.4}
                        radius={isHighPerf ? 0.6 : 0.3}
                    />
                </EffectComposer>
            )}

            <Preload all />
        </Canvas>
    );
}
