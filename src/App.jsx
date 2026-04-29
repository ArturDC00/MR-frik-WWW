'use client';

import React, { useState, useEffect, useRef, lazy, Suspense, useCallback, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ============ SEKCJE - LAZY (ładowane dopiero gdy potrzebne) ============
const ProcessSection = lazy(() => import('./components/Sections/ProcessSection').then(m => ({ default: m.ProcessSection })));
const ValuesSection = lazy(() => import('./components/Sections/ValuesSection').then(m => ({ default: m.ValuesSection })));
const TrustSection = lazy(() => import('./components/Sections/TrustSection').then(m => ({ default: m.TrustSection })));
const FAQSection = lazy(() => import('./components/Sections/FAQSection').then(m => ({ default: m.FAQSection })));
const TestimonialsSection = lazy(() => import('./components/Sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
const ContactSection = lazy(() => import('./components/Sections/ContactSection').then(m => ({ default: m.ContactSection })));

// ============ PLATFORM SECTION ============
const PlatformSection = lazy(() => import('./components/Sections/Platformsection').then(m => ({ default: m.PlatformSection })));

// ============ UTILS & STYLES ============
import { vector3ToLatLng, latLngToVector3 } from './utils/math';
import { isPointInPolygon } from './utils/geography';
import { SmoothScroll } from './utils/SmoothScroll';

// ============ GLOBE — osobny chunk (Three.js / R3F / postprocessing) ============
import { StaticHeroPlaceholder } from './components/UI/StaticHeroPlaceholder';

const WebGLCanvas = dynamic(() => import('./components/Globe/WebGLCanvas'), {
    ssr: false,
    loading: () => <StaticHeroPlaceholder />,
});

// ============ UI COMPONENTS ============
import { Loader } from './components/UI/Loader';
import { Tooltip } from './components/UI/Tooltip';
import { InfoPanel } from './components/UI/InfoPanel';
import { HeroContent } from './components/UI/HeroContent';
import { AmbientSound } from './components/Audio/AmbientSound';
// import { Navbar } from './components/UI/Navbar';

// ============ EFEKTY ============
import { CustomCursor } from './components/UI/CustomCursor';
import { StarField } from './components/Effects/FilmGrain';
import { CookieConsent } from './components/UI/CookieConsent';

const GLOBE_RADIUS = 32;

const TARGET_COUNTRIES = [
    "United States of America",
    "United States",
    "Canada",
    "Germany",
    "Poland",
    "Netherlands"
];

// Precyzyjne centroidy — kamera zawsze trafia do centrum kraju
const COUNTRY_CENTROIDS = {
    "United States of America": { lat: 39.5,  lng: -98.35  },
    "United States":             { lat: 39.5,  lng: -98.35  },
    "Canada":                    { lat: 56.1,  lng: -106.3  },
    "Germany":                   { lat: 51.16, lng:  10.45  },
    "Poland":                    { lat: 51.92, lng:  19.14  },
    "Netherlands":               { lat: 52.37, lng:   5.29  },
};

// Tłumaczenia nazw krajów na polski
const COUNTRY_NAMES_PL = {
    "United States of America": "Stany Zjednoczone",
    "United States":             "Stany Zjednoczone",
    "Canada":                    "Kanada",
    "Germany":                   "Niemcy",
    "Poland":                    "Polska",
    "Netherlands":               "Holandia",
};

// ============================================================
// FALLBACK dla lazy sekcji - niewidoczny placeholder
// ============================================================
function SectionFallback() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#020203',
        }} />
    );
}

// ============================================================
// PRZYCISKI NAWIGACYJNE NA GLOBUSIE
// Desktop: pionowy pasek po prawej stronie
// Mobile: floating FAB button + overlay menu (10/10 UX)
// ============================================================
function GlobeNavButtons({ show }) {
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const scrollTo = (id) => {
        setMobileOpen(false);
        const el = document.getElementById(id);
        if (!el) return;
        // Lenis v1 — używamy lenis.scrollTo() zamiast scrollIntoView (inaczej scroll się "bije")
        if (window.lenis) window.lenis.scrollTo(el, { offset: -20 });
        else el.scrollIntoView({ behavior: 'smooth' });
    };

    const buttons = [
        { id: 'section-process', label: 'Proces importu' },
        { id: 'section-values', label: 'Nasze wartości' },
        { id: 'section-trust', label: 'Twoje korzyści' },
        { id: 'section-platform', label: 'Platforma MrFrik' },
        { id: 'section-reviews', label: 'Opinie klientów' },
        { id: 'section-faq', label: 'Baza wiedzy' },
        { id: 'section-contact', label: 'Skontaktuj się', accent: true },
    ];

    if (!show) return null;

    return (
        <>
            <style>{`
                /* ── DESKTOP: pionowy pasek po prawej ── */
                .gnb-wrap {
                    position: fixed;
                    right: 32px;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 50;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .gnb-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(2,2,3,0.55);
                    border: 1px solid rgba(255,255,255,0.12);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-radius: 100px;
                    padding: 10px 18px;
                    cursor: pointer;
                    color: #F5F5F5;
                    font-family: Inter, sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                    transition: all 0.25s ease;
                    outline: none;
                    flex-shrink: 0;
                }
                .gnb-btn:hover {
                    background: rgba(253,151,49,0.18);
                    border-color: rgba(253,151,49,0.6);
                    color: #FD9731;
                }
                .gnb-btn-accent {
                    background: linear-gradient(90deg, rgba(253,151,49,0.18) 0%, rgba(207,106,5,0.18) 100%);
                    border-color: rgba(253,151,49,0.5);
                    color: #FD9731;
                }
                .gnb-btn-accent:hover {
                    background: linear-gradient(90deg, rgba(253,151,49,0.32) 0%, rgba(207,106,5,0.32) 100%);
                    border-color: #FD9731;
                }

                /* ── MEDIUM SCREENS: dot-only nav (zapobiega zakrywaniu treści) ── */
                @media (min-width: 768px) and (max-width: 1400px) {
                    .gnb-wrap { right: 16px; }
                    .gnb-btn { padding: 10px; gap: 0; }
                    .gnb-label { display: none; }
                }

                /* ── MOBILE: ukryj desktop nav ── */
                @media (max-width: 767px) {
                    .gnb-wrap { display: none; }
                }

                /* ── FLOATING ACTION BUTTON (mobile only) ── */
                /* Nad warstwą hero (10020), pod cookies (10080) */
                .gnb-fab {
                    display: none;
                    position: fixed;
                    bottom: max(28px, env(safe-area-inset-bottom, 28px));
                    right: 20px;
                    z-index: 10070;
                    width: 54px;
                    height: 54px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #FD9731 0%, #CF6A05 100%);
                    border: none;
                    cursor: pointer;
                    align-items: center;
                    justify-content: center;
                    box-shadow:
                        0 4px 20px rgba(253,151,49,0.5),
                        0 2px 8px rgba(0,0,0,0.35);
                    transition:
                        transform 0.25s cubic-bezier(.34,1.56,.64,1),
                        box-shadow 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                    outline: none;
                }
                .gnb-fab:active {
                    transform: scale(0.92);
                }
                @media (max-width: 767px) {
                    .gnb-fab { display: flex; }
                }

                /* ── MOBILE OVERLAY ── */
                .gnb-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 10045;
                    background: rgba(2,2,3,0.75);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding: 0 16px;
                    padding-bottom: max(96px, calc(env(safe-area-inset-bottom, 0px) + 88px));
                    box-sizing: border-box;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.25s ease;
                }
                .gnb-overlay.open {
                    opacity: 1;
                    pointer-events: auto;
                }
                .gnb-menu {
                    width: 100%;
                    max-width: 420px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    transform: translateY(20px);
                    transition: transform 0.3s cubic-bezier(.34,1.2,.64,1);
                }
                .gnb-overlay.open .gnb-menu {
                    transform: translateY(0);
                }
                .gnb-mob-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.10);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-radius: 16px;
                    padding: 16px 20px;
                    cursor: pointer;
                    color: #F5F5F5;
                    font-family: Inter, sans-serif;
                    font-size: 16px;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                    text-align: left;
                    transition: background 0.2s ease, border-color 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                    outline: none;
                }
                .gnb-mob-btn:active {
                    background: rgba(255,255,255,0.10);
                }
                .gnb-mob-btn-accent {
                    background: linear-gradient(90deg, rgba(253,151,49,0.15) 0%, rgba(207,106,5,0.12) 100%);
                    border-color: rgba(253,151,49,0.35);
                    color: #FD9731;
                    font-weight: 600;
                }
            `}</style>

            {/* Desktop nav */}
            <div className="gnb-wrap">
                {buttons.map((btn) => (
                    <button
                        key={btn.id}
                        onClick={() => scrollTo(btn.id)}
                        className={`gnb-btn${btn.accent ? ' gnb-btn-accent' : ''}`}
                        aria-label={btn.label}
                    >
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#FD9731',
                            boxShadow: '0 0 8px rgba(253,151,49,0.8)',
                            flexShrink: 0,
                        }} />
                        <span className="gnb-label">{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Mobile: Floating Action Button */}
            <button
                className="gnb-fab"
                onClick={() => setMobileOpen(o => !o)}
                aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu nawigacji'}
            >
                {mobileOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="3" y1="7" x2="21" y2="7"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="17" x2="21" y2="17"/>
                    </svg>
                )}
            </button>

            {/* Mobile: Overlay menu */}
            <div
                className={`gnb-overlay${mobileOpen ? ' open' : ''}`}
                onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
            >
                <div className="gnb-menu">
                    {buttons.map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => scrollTo(btn.id)}
                            className={`gnb-mob-btn${btn.accent ? ' gnb-mob-btn-accent' : ''}`}
                        >
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#FD9731',
                                boxShadow: '0 0 8px rgba(253,151,49,0.7)',
                                flexShrink: 0,
                            }} />
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

// ============================================================
// GLOBALNA DETEKCJA WYDAJNOŚCI — raz na session
// Obejmuje: stare smartfony, low-end Androidy, małe ekrany
// ============================================================
function detectPerfTier() {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const isSmallScreen = window.innerWidth < 768;
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // LOW: mobile, mało zasobów, stary sprzęt, redukcja animacji
    if (isMobile || isSmallScreen || prefersReduced || cores < 4 || memory < 4) {
        return 'LOW';
    }
    // HIGH: 8+ rdzeni i 8+ GB RAM
    if (cores >= 8 && memory >= 8) {
        return 'HIGH';
    }
    // MID: wszystko pomiędzy (4–7 rdzeni lub 4–7 GB RAM)
    return 'MID';
}

export default function App() {
    const [loading, setLoading] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [introDone, setIntroDone] = useState(false);
    // ✅ Widoczność Canvas — opóźniona żeby dać WebGL czas na kompilację shaderów
    // i uniknąć żółtego rozbłysku z Bloom gdy kamera jest tuż przy globusie
    const [globeVisible, setGlobeVisible] = useState(false);
    // ✅ Tier wydajności: 'LOW' | 'MID' | 'HIGH'
    const [perfTier] = useState(detectPerfTier);
    const isLowPerf = perfTier === 'LOW';
    const isHighPerf = perfTier === 'HIGH';

    const [geoDataRef, setGeoDataRef] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [activeGeometry, setActiveGeometry] = useState(null);
    const [focusPoint, setFocusPoint] = useState(null);
    const [hoverName, setHoverName] = useState(null);
    const [hoverGeometry, setHoverGeometry] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [scrollProgress, setScrollProgress] = useState(0);

    const [isGlobeInteracting, setIsGlobeInteracting] = useState(false);
    /** Po najechaniu na kraj / obrocie globusa: wstrzymaj auto-obrót siatki (mobile nie „wraca” do USA). */
    const [globeAutoSpinPaused, setGlobeAutoSpinPaused] = useState(false);
    const [sectionsReady, setSectionsReady] = useState(false);
    // activePort usunięte — porty zastąpione country info cards
    const globeRotation = useRef(0);
    // ============ RESET SCROLL na start — iOS Safari restoruje pozycję scrolla z poprzedniej wizyty ============
    useEffect(() => {
        window.scrollTo(0, 0);
        // Wymuś przez history API żeby Lenis też zresetował
        if (window.history.scrollRestoration) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    // ============ LOADER ============
    useEffect(() => {
        const i = setInterval(() => {
            setLoading(p => {
                if (p >= 100) { clearInterval(i); return 100; }
                return p + 1.2;
            });
        }, 20);
        return () => clearInterval(i);
    }, []);

    // ============ GLOBE VISIBILITY — opóźnione fade-in ============
    // Zapobiega żółtemu rozbłyskowi z Bloom gdy kamera startuje tuż przy globusie
    // Na LOW/mobile: dłuższe opóźnienie (shadery kompilują się wolniej)
    useEffect(() => {
        if (!isLoaded) return;
        const delay = isLowPerf ? 800 : isHighPerf ? 400 : 600;
        const t = setTimeout(() => setGlobeVisible(true), delay);
        return () => clearTimeout(t);
    }, [isLoaded, isLowPerf, isHighPerf]);

    // ============ PRELOAD SEKCJI po zakończeniu intro ============
    useEffect(() => {
        if (introDone) {
            const t = setTimeout(() => setSectionsReady(true), 500);
            return () => clearTimeout(t);
        }
    }, [introDone]);

    // ============ SCROLL HANDLER ============
    // Śledzi scroll przez Lenis ('app:scroll') + window fallback
    useEffect(() => {
        const update = (raw) => {
            const newProgress = Math.min(raw / window.innerHeight, 1);
            setScrollProgress(prev =>
                Math.abs(newProgress - prev) > 0.003 ? newProgress : prev
            );
        };
        const onLenis = (e) => update(e.detail);
        const onScroll = () => update(window.scrollY);
        window.addEventListener('app:scroll', onLenis);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('app:scroll', onLenis);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const onOrbitInteractionEnd = useCallback(() => {
        setGlobeAutoSpinPaused(true);
    }, []);

    // ============ HANDLE GLOBE EVENT ✅ Z INLINE findCountry ============
    const handleGlobeEvent = useCallback((type, payload) => {
        if (type === 'LOADED') {
            // ✅ startTransition: render z nowym geoDataRef jest non-urgent
            // → React może podzielić pracę między frames i nie zablokować UI
            startTransition(() => setGeoDataRef(payload));
            return;
        }
        if (!introDone) return;

        const { point = null, rot = 0, event = null } = payload || {};

        // ✅ Inline findCountry - bez potrzeby dodawania do dependencies
        let result = null;
        if (geoDataRef && point) {
            const corrected = point.clone();
            // Normalizacja kąta do [-π, π] zapobiega akumulacji float przy długiej sesji
            const normalizedRot = rot - Math.round(rot / (2 * Math.PI)) * (2 * Math.PI);
            corrected.applyAxisAngle(new THREE.Vector3(0, 1, 0), -normalizedRot);
            // Hitbox sphere ma radius GLOBE_RADIUS+0.5 — używamy rzeczywistego promienia punktu
            // aby acos(y/r) był dokładny (bez tego błąd ~1° szerokości geograficznej)
            const hitRadius = Math.sqrt(corrected.x ** 2 + corrected.y ** 2 + corrected.z ** 2);
            const { lat, lng } = vector3ToLatLng(corrected.x, corrected.y, corrected.z, hitRadius);
            const check = (poly) => isPointInPolygon([lng, lat], poly);

            for (const f of geoDataRef.features) {
                if (f.geometry.type === 'Polygon' && check(f.geometry.coordinates[0])) {
                    result = { f, corrected, lat, lng };
                    break;
                } else if (f.geometry.type === 'MultiPolygon') {
                    for (const poly of f.geometry.coordinates) {
                        if (check(poly[0])) {
                            result = { f, corrected, lat, lng };
                            break;
                        }
                    }
                    if (result) break;
                }
            }
        }

        let validResult = null;
        if (result) {
            const props = result.f.properties;
            const name = props.admin || props.name || props.name_long || "Unknown";
            if (TARGET_COUNTRIES.includes(name)) validResult = result;
        }

        if (type === 'CLICK') {
            if (validResult) {
                setGlobeAutoSpinPaused(true);
                const props = validResult.f.properties;
                const name = props.admin || props.name || props.name_long;
                setIsGlobeInteracting(true);
                setSelectedData({
                    name: name,
                    namePl: COUNTRY_NAMES_PL[name] || name,
                    coords: `${Math.abs(validResult.lat).toFixed(2)}°${validResult.lat > 0 ? 'N' : 'S'}, ${Math.abs(validResult.lng).toFixed(2)}°${validResult.lng > 0 ? 'E' : 'W'}`
                });
                const coords = validResult.f.geometry.type === 'Polygon'
                    ? [validResult.f.geometry.coordinates[0]]
                    : validResult.f.geometry.coordinates.map(p => p[0]);
                setActiveGeometry(coords);

                // FIX: używaj centroidu kraju zamiast punktu kliknięcia
                // Punkt kliknięcia zależy od aktualnej rotacji globusa i może wskazywać
                // złą część globusa gdy obrót był niezsynchronizowany.
                // Centroid jest zawsze geograficznie poprawny.
                const centroid = COUNTRY_CENTROIDS[name];
                if (centroid) {
                    setFocusPoint(latLngToVector3(centroid.lat, centroid.lng, GLOBE_RADIUS));
                } else {
                    setFocusPoint(latLngToVector3(validResult.lat, validResult.lng, GLOBE_RADIUS));
                }
            } else {
                // handleClose inline
                setSelectedData(null);
                setActiveGeometry(null);
                setFocusPoint(null);
                setHoverGeometry(null);
                setIsGlobeInteracting(false);
            }
        } else if (type === 'HOVER') {
            if (!point) {
                setHoverName(null);
                setHoverGeometry(null);
                if (!selectedData) setIsGlobeInteracting(false);
                return;
            }
            if (validResult && event) {
                setGlobeAutoSpinPaused(true);
                const props = validResult.f.properties;
                const name = props.admin || props.name || props.name_long;
                setIsGlobeInteracting(true);
                setHoverName(COUNTRY_NAMES_PL[name] || name);
                setMousePos({ x: event.clientX, y: event.clientY });
                const coords = validResult.f.geometry.type === 'Polygon'
                    ? [validResult.f.geometry.coordinates[0]]
                    : validResult.f.geometry.coordinates.map(p => p[0]);
                setHoverGeometry(coords);
            } else {
                setHoverName(null);
                setHoverGeometry(null);
            }
        }
    }, [introDone, geoDataRef, selectedData]);

    const handleClose = () => {
        setSelectedData(null);
        setActiveGeometry(null);
        setFocusPoint(null);
        setHoverGeometry(null);
        setIsGlobeInteracting(false);
    };

    return (
        <>
            <CustomCursor />
            <CookieConsent />

            {/* Navbar - widoczny na hero, znika przy scrollu */}
            {/* <AnimatePresence> */}
                {/* {introDone && scrollProgress < 0.4 && ( */}
                    {/* <Navbar scrolled={scrollProgress > 0.05} /> */}
                {/* )} */}
            {/* </AnimatePresence> */}

            {/* Przyciski nawigacyjne — zawsze widoczne po intro */}
            <div style={{
                opacity: introDone ? 1 : 0,
                transition: 'opacity 0.6s ease',
                pointerEvents: introDone ? 'auto' : 'none',
            }}>
                <GlobeNavButtons show={introDone} />
            </div>

            <SmoothScroll>
                <AmbientSound play={isLoaded} />
                {/* LOW=50, MID=90, HIGH=150 cząsteczek gwiazd */}
                <StarField particleCount={isLowPerf ? 50 : isHighPerf ? 150 : 90} speed={0.2} paused={scrollProgress > 0.15} />

                {/* HERO BACKGROUND */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100vh',
                    background: '#020203',
                    zIndex: 1
                }} />

                {/* ✅ GLOBUS */}
                <div
                    data-lenis-prevent
                    style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100vw', height: '100vh',
                    zIndex: 2,
                    pointerEvents: scrollProgress > 0.3 ? 'none' : 'auto',
                    /* 'none': Lenis + pan-y na tablecie przejmowały drugi gest (scroll) zamiast obrotu globusa */
                    touchAction: 'none',
                    // ✅ globeVisible: opóźnione fade-in chroni przed żółtym rozbłyskiem Bloom
                    opacity: globeVisible ? Math.max(0, 1 - scrollProgress * 1.5) : 0,
                    transition: globeVisible ? 'opacity 1.2s ease-out' : 'none',
                }}>
                    <WebGLCanvas
                        isLowPerf={isLowPerf}
                        isHighPerf={isHighPerf}
                        scrollProgress={scrollProgress}
                        introDone={introDone}
                        isLoaded={isLoaded}
                        focusPoint={focusPoint}
                        onIntroComplete={() => setIntroDone(true)}
                        onGlobeEvent={handleGlobeEvent}
                        onOrbitInteractionEnd={onOrbitInteractionEnd}
                        activeGeometry={activeGeometry}
                        hoverGeometry={hoverGeometry}
                        globeRotation={globeRotation}
                        globeAutoSpinPaused={globeAutoSpinPaused}
                        hasHoverGeometry={Boolean(hoverGeometry)}
                        hasActiveGeometry={Boolean(activeGeometry)}
                        hasFocusPoint={Boolean(focusPoint)}
                    />
                </div>

                {/* ✅ LOADER — nad hero do końca animacji; potem isLoaded → null (strona widoczna) */}
                <Loader progress={loading} onComplete={() => setIsLoaded(true)} isLoaded={isLoaded} />

                {/* UI LAYER — pod loaderem do momentu isLoaded; potem pełny hero */}
                <div style={{
                    position: 'relative',
                    zIndex: 10020,
                    pointerEvents: 'none',
                    opacity: Math.max(0, 1 - scrollProgress * 2),
                    transition: 'opacity 0.3s ease'
                }}>
                    <div style={{ height: '100vh', position: 'relative' }}>
                        <HeroContent
                            scrollProgress={scrollProgress}
                            isGlobeInteracting={isGlobeInteracting}
                            introDone={introDone}
                        />
                    </div>

                    {hoverName && !selectedData && introDone && (
                        <Tooltip name={hoverName} x={mousePos.x} y={mousePos.y} />
                    )}
                </div>

                {/* SEKCJE - lazy loaded, renderowane dopiero po intro */}
                <main style={{
                    position: 'relative',
                    zIndex: 10,
                    background: '#020203',
                    pointerEvents: 'auto'
                }}>
                    <div id="section-process">
                        {sectionsReady ? (
                            <Suspense fallback={<SectionFallback />}>
                                <ProcessSection />
                            </Suspense>
                        ) : (
                            <SectionFallback />
                        )}
                    </div>

                    <div id="section-values" style={{ paddingTop: 'clamp(48px, 7vh, 100px)' }}>
                        {sectionsReady ? (
                            <Suspense fallback={<SectionFallback />}>
                                <ValuesSection />
                            </Suspense>
                        ) : (
                            <SectionFallback />
                        )}
                    </div>

                    <div id="section-trust" style={{ paddingTop: 'clamp(48px, 7vh, 100px)' }}>
                        {sectionsReady ? (
                            <Suspense fallback={<SectionFallback />}>
                                <TrustSection />
                            </Suspense>
                        ) : (
                            <SectionFallback />
                        )}
                    </div>

                    {/* ✅ PLATFORMSECTION - PO TRUST SECTION */}
                    <div id="section-platform" style={{ paddingTop: 'clamp(48px, 7vh, 100px)' }}>
                        {sectionsReady ? (
                            <Suspense fallback={<SectionFallback />}>
                                <PlatformSection />
                            </Suspense>
                        ) : (
                            <SectionFallback />
                        )}
                    </div>

                    <div id="section-reviews" style={{ paddingTop: 'clamp(48px, 7vh, 100px)' }}>
                        {sectionsReady ? (
                            <Suspense fallback={<SectionFallback />}>
                                <TestimonialsSection />
                            </Suspense>
                        ) : (
                            <SectionFallback />
                        )}
                    </div>

                    <div id="section-faq" style={{ paddingTop: 'clamp(48px, 7vh, 100px)' }}>
                        {sectionsReady ? (
                            <Suspense fallback={<SectionFallback />}>
                                <FAQSection />
                            </Suspense>
                        ) : (
                            <SectionFallback />
                        )}
                    </div>

                    <div id="section-contact-wrap" style={{ paddingTop: 'clamp(48px, 7vh, 100px)' }}>
                        {sectionsReady ? (
                            <Suspense fallback={<SectionFallback />}>
                                <ContactSection />
                            </Suspense>
                        ) : (
                            <SectionFallback />
                        )}
                    </div>
                </main>

            </SmoothScroll>

            {/* InfoPanel — poza divem z opacity aby uniknąć stacking context (opacity tworzy nowy) */}
            <AnimatePresence>
                {selectedData && <InfoPanel data={selectedData} onClose={handleClose} />}
            </AnimatePresence>
        </>
    );
}