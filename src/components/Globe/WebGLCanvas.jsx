'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { COLORS } from '../../constants/colors';
import { ElegantGlobe } from './ElegantGlobe';
import { CameraController } from './CameraController';

/**
 * Ciągłość czasu animacji przy zmianie `frameloop`.
 *
 * R3F przy KAŻDEJ zmianie trybu pętli (setFrameloop w @react-three/fiber) robi
 * `clock.stop(); clock.elapsedTime = 0; clock.start()` — zeruje zegar. Sześć animacji globusa
 * liczy się z `state.clock.elapsedTime`: statki (ElegantGlobe), trasy (AnimatedRoutes),
 * pulsowanie portów (PortMarker ×2) i cztery uniformy uTime shaderów. Scroll w dół za 0.68
 * przełączał pętlę na 'demand', powrót na hero z powrotem na 'always' — i za każdym razem
 * wszystko wracało do t=0: statki skakały na początek tras, shadery i pulsy resetowały fazę.
 *
 * Zamiast walczyć z kolejnością efektów (kiedy dokładnie R3F zeruje zegar względem naszego
 * commitu), naprawiamy to w pętli: pamiętamy ostatni czas i jeśli w kolejnej klatce zegar
 * poszedł WSTECZ, to znaczy, że R3F go wyzerował — odtwarzamy ostatnią wartość + bieżącą deltę.
 *
 * Kolejność: R3F woła getDelta() (dodaje deltę do elapsedTime) PRZED subskrybentami useFrame,
 * a subskrybenci o tym samym priorytecie lecą w kolejności montowania. Ten komponent jest
 * pierwszym dzieckiem Canvas, więc naprawia zegar, zanim przeczyta go ktokolwiek inny —
 * żadna animacja nie widzi nawet jednej klatki z wyzerowanym czasem.
 */
function ClockContinuity() {
    const lastElapsed = useRef(null);

    useFrame((state, delta) => {
        const clock = state.clock;
        if (lastElapsed.current !== null && clock.elapsedTime < lastElapsed.current) {
            clock.elapsedTime = lastElapsed.current + delta;
        }
        lastElapsed.current = clock.elapsedTime;
    });

    return null;
}

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

/** Stałe propsy Canvas — poza komponentem, żeby rzadkie re-rendery nie podawały nowych obiektów. */
const CANVAS_STYLE = { touchAction: 'none' };
const CANVAS_CAMERA = { position: [0, 15, 80], fov: 42 };
/**
 * antialias: false na KAŻDYM tierze. MID/HIGH rysują scenę do render targetu EffectComposera
 * (multisampling={0}), a do domyślnego framebuffera trafia tylko pełnoekranowy trójkąt z efektem
 * końcowym — MSAA domyślnego bufora wygładzałby wyłącznie krawędzie tego trójkąta, czyli nic.
 * Był to więc 4x wielopróbkowany bufor pełnej rozdzielczości alokowany i rozwiązywany co klatkę
 * na darmo. LOW (bez composera) i tak miał antialias: false. Obraz identyczny.
 */
const CANVAS_GL = { antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: false };
const DPR_LOW = [0.75, 1];
const DPR_MID = [1, 1.25];
const DPR_HIGH = [1, 1.5];

/**
 * Cały drzewo R3F — ładowane osobnym chunkiem (next/dynamic w App.jsx).
 *
 * React.memo: App przerenderowuje się z powodów niezwiązanych ze sceną (loader, zmiana kraju pod
 * kursorem, progi scrolla). Wszystkie propsy są prymitywami albo stabilnymi referencjami, więc memo
 * pomija wtedy rekoncyliację całej sceny i `root.configure()` R3F.
 */
function WebGLCanvas({
    perfTier,
    isLowPerf,
    isHighPerf,
    globeIdle,
    introDone,
    isLoaded,
    focusPoint,
    onIntroComplete,
    onGlobeEvent,
    onOrbitInteractionEnd,
    globeRotation,
    globeAutoSpinPaused,
    hasHoverGeometry,
    hasActiveGeometry,
    hasFocusPoint,
}) {
    const pauseAutoRotate =
        globeAutoSpinPaused || hasHoverGeometry || hasActiveGeometry || hasFocusPoint;

    const orbitRotateSpeed = isLowPerf ? 0.65 : 0.5;

    // true, gdy kamera leci do kraju albo wraca do widoku ogólnego — OrbitControls są wtedy wyłączone,
    // żeby nie przejmowały kamery w połowie animacji. Zmienia się tylko przy przejściach stanu kamery.
    const [cameraBusy, setCameraBusy] = useState(false);

    const handleHover = useCallback(
        (point, rot, e) => onGlobeEvent('HOVER', { point, rot, event: e }),
        [onGlobeEvent],
    );

    /**
     * Tryb pętli renderowania:
     *
     * - przed `isLoaded` → 'demand'. Nieprzezroczysty loader zasłania wtedy wszystko, a kontener
     *   globusa ma opacity 0 — wcześniej scena z Bloom (~17 pełnoekranowych przejść) renderowała się
     *   w tym czasie 60x/s zupełnie niewidocznie, zabierając GPU i główny wątek loaderowi.
     *   CameraController w stanie INIT tylko ustawia kamerę na starcie, więc jedna klatka wystarcza.
     *   Przejście na 'always' wznawia pętlę: każda zmiana stanu R3F wywołuje invalidate().
     * - w trakcie intro → 'always', niezależnie od scrolla. ⚠️ Krytyczne: intro kamery jedzie na
     *   useFrame, a przy 'demand' fiber nie woła subskrybentów. Bez tego przescrollowanie przed końcem
     *   intro zamrażało kamerę — `introDone` nigdy nie odpalało i strona zostawała czarna.
     * - po intro → 'demand' dopiero gdy globus jest mocno zjedzony scrollem (`globeIdle`, >= 0.68).
     */
    const frameMode = !isLoaded ? 'demand' : !introDone || !globeIdle ? 'always' : 'demand';

    const dpr = isLowPerf ? DPR_LOW : isHighPerf ? DPR_HIGH : DPR_MID;

    return (
        <Canvas
            style={CANVAS_STYLE}
            dpr={dpr}
            frameloop={frameMode}
            gl={CANVAS_GL}
            camera={CANVAS_CAMERA}
        >
            <ClockContinuity />
            <InvalidateAfterFocusClear focusPoint={focusPoint} />

            <CameraController
                isLoaded={isLoaded}
                target={focusPoint}
                onIntroComplete={onIntroComplete}
                onBusyChange={setCameraBusy}
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
                onHover={handleHover}
                hasActiveGeometry={hasActiveGeometry}
                globeRotation={globeRotation}
                isIntroDone={introDone}
                pauseAutoRotate={pauseAutoRotate}
                enableGeoFetch={isLoaded}
            />

            {introDone && (
                <StableOrbitControls
                    enabled={!focusPoint && !cameraBusy}
                    onEnd={onOrbitInteractionEnd}
                    rotateSpeed={orbitRotateSpeed}
                />
            )}

            {/* enabled={isLoaded}: przy false composer oddaje rysowanie zwykłemu renderowi R3F
                (priorytet useFrame spada do 0), więc Bloom nie liczy się pod loaderem. */}
            {!isLowPerf && (
                <EffectComposer enabled={isLoaded} disableNormalPass multisampling={0}>
                    <Bloom
                        luminanceThreshold={0.1}
                        mipmapBlur
                        intensity={isHighPerf ? 0.8 : 0.4}
                        radius={isHighPerf ? 0.6 : 0.3}
                    />
                </EffectComposer>
            )}

            {/* Bez <Preload all />: renderował całą scenę 6 razy (kamera sześcienna) przy montażu,
                gdy geojson jeszcze nie był pobrany, a trasy, statki i porty nie istniały — nie
                kompilował więc żadnego z materiałów, dla których go dodano. */}
        </Canvas>
    );
}

export default React.memo(WebGLCanvas);
