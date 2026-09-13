'use client';

import React, { useState, useEffect, useRef, lazy, Suspense, useCallback, useMemo, startTransition } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';

// ============ SEKCJE - LAZY ============
// Thunki trzymamy osobno, żeby móc je odpalić jako PREFETCH jeszcze w czasie loadera —
// wtedy sieć stoi bezczynnie, a `lazy()` rozwiąże się później z cache'u webpacka natychmiast.
const SECTION_IMPORTS = [
    () => import('./components/Sections/ProcessSection').then(m => ({ default: m.ProcessSection })),
    () => import('./components/Sections/ValuesSection').then(m => ({ default: m.ValuesSection })),
    () => import('./components/Sections/TrustSection').then(m => ({ default: m.TrustSection })),
    () => import('./components/Sections/Platformsection').then(m => ({ default: m.PlatformSection })),
    () => import('./components/Sections/TestimonialsSection').then(m => ({ default: m.TestimonialsSection })),
    () => import('./components/Sections/FAQSection').then(m => ({ default: m.FAQSection })),
    () => import('./components/Sections/ContactSection').then(m => ({ default: m.ContactSection })),
];

const ProcessSection = lazy(SECTION_IMPORTS[0]);
const ValuesSection = lazy(SECTION_IMPORTS[1]);
const TrustSection = lazy(SECTION_IMPORTS[2]);
const PlatformSection = lazy(SECTION_IMPORTS[3]);
const TestimonialsSection = lazy(SECTION_IMPORTS[4]);
const FAQSection = lazy(SECTION_IMPORTS[5]);
const ContactSection = lazy(SECTION_IMPORTS[6]);

// ============ UTILS & STYLES ============
// geoMath = czysty JS bez `three` — three.core zostaje w chunku globusa, nie w eager grupie App.
import {
    pointToLatLng,
    latLngToPoint,
    rotateAroundY,
    normalizeAngle,
    pointLength,
} from './utils/geoMath';
import { isPointInPolygon } from './utils/geography';
import { SmoothScroll } from './utils/SmoothScroll';

// ============ GLOBE — osobny chunk (Three.js / R3F / postprocessing) ============
// Fallback to samo tło, a nie StaticHeroPlaceholder: prawdziwe hero renderuje teraz serwer
// (HeroContent), więc placeholder dublowałby <h1> i drugi <Image priority> w tym samym momencie.
// Do tego siedzi w kontenerze globusa, którego opacity jest 0 aż do `globeVisible` — czyli
// w realnym ładowaniu był i tak niewidoczny.
const WebGLCanvas = dynamic(() => import('./components/Globe/WebGLCanvas'), {
    ssr: false,
    loading: () => <div style={{ position: 'absolute', inset: 0, background: '#020203' }} />,
});

/** Osobne chunki — mniej pracy na starcie (TBT); bez zmiany logiki scrolla / globusa. */
const CustomCursor = dynamic(
    () => import('./components/UI/CustomCursor').then((m) => ({ default: m.CustomCursor })),
    { ssr: false }
);
const CookieConsent = dynamic(
    () => import('./components/UI/CookieConsent').then((m) => ({ default: m.CookieConsent })),
    { ssr: false }
);
const AmbientSound = dynamic(
    () => import('./components/Audio/AmbientSound').then((m) => ({ default: m.AmbientSound })),
    { ssr: false }
);

// ============ UI COMPONENTS ============
import { Loader } from './components/UI/Loader';
import { Tooltip } from './components/UI/Tooltip';
import { InfoPanel } from './components/UI/InfoPanel';
import { HeroContent } from './components/UI/HeroContent';
// import { Navbar } from './components/UI/Navbar';

// ============ EFEKTY ============
import { StarField } from './components/Effects/FilmGrain';

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

/**
 * `id` — cel scrollTo. `observe` — element, którego widoczność wyznacza aktywną sekcję,
 * gdy różni się od celu: id="section-contact" żyje WEWNĄTRZ lazy ContactSection, a wrapper
 * w App (zawsze w DOM, także zanim sekcja się zamontuje) to "section-contact-wrap".
 * Poza modułem, bo to stała — w ciele komponentu tworzyłaby się od nowa przy każdym renderze.
 */
const NAV_BUTTONS = [
    { id: 'section-process', label: 'Proces importu' },
    { id: 'section-values', label: 'Nasze wartości' },
    { id: 'section-trust', label: 'Twoje korzyści' },
    { id: 'section-platform', label: 'Platforma MrFrik' },
    { id: 'section-reviews', label: 'Opinie klientów' },
    { id: 'section-faq', label: 'Baza wiedzy' },
    { id: 'section-contact', observe: 'section-contact-wrap', label: 'Skontaktuj się', accent: true },
];

/**
 * Która sekcja jest aktualnie oglądana — do podświetlenia w prawym pasku.
 *
 * IntersectionObserver z cienkim pasem na wysokości ~40% ekranu: sekcja jest aktywna, gdy
 * przecina ten pas. Wrappery sekcji w App są ciągłe (odstęp to paddingTop NASTĘPNEGO wrappera,
 * nie przerwa między nimi), więc pas zawsze trafia w dokładnie jedną sekcję — a na hero w żadną.
 *
 * Obserwujemy wrappery z App, nie wnętrza sekcji: są w DOM od pierwszego renderu i obejmują
 * pin-spacery GSAP (ProcessSection i ValuesSection są przypinane), więc aktywność trwa przez
 * cały dystans pinu. Stan jest lokalny dla paska — zmiana sekcji nie re-renderuje App.
 */
function useActiveSection(enabled) {
    const [activeId, setActiveId] = React.useState(null);

    useEffect(() => {
        if (!enabled) return undefined;

        const idByElement = new Map();
        for (const b of NAV_BUTTONS) {
            const el = document.getElementById(b.observe || b.id);
            if (el) idByElement.set(el, b.id);
        }
        if (idByElement.size === 0) return undefined;

        const intersecting = new Set();
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const id = idByElement.get(entry.target);
                    if (entry.isIntersecting) intersecting.add(id);
                    else intersecting.delete(id);
                }
                // Na styku dwóch sekcji pas może chwilę przecinać obie — wygrywa późniejsza.
                let next = null;
                for (const b of NAV_BUTTONS) if (intersecting.has(b.id)) next = b.id;
                setActiveId(next);
            },
            { rootMargin: '-40% 0px -59% 0px', threshold: 0 },
        );

        idByElement.forEach((_, el) => io.observe(el));
        return () => io.disconnect();
    }, [enabled]);

    return activeId;
}

function GlobeNavButtons({ show }) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const activeId = useActiveSection(show);

    const scrollTo = (id) => {
        setMobileOpen(false);
        const el = document.getElementById(id);
        if (!el) return;
        // Lenis v1 — używamy lenis.scrollTo() zamiast scrollIntoView (inaczej scroll się "bije")
        if (window.lenis) window.lenis.scrollTo(el, { offset: -20 });
        else el.scrollIntoView({ behavior: 'smooth' });
    };

    const buttons = NAV_BUTTONS;

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
                /* .is-active = sekcja aktualnie oglądana. Wspólny selektor z :hover, żeby
                   podświetlenie od scrolla było identyczne jak przy najechaniu myszką. */
                .gnb-btn:hover,
                .gnb-btn.is-active {
                    background: rgba(253,151,49,0.18);
                    border-color: rgba(253,151,49,0.6);
                    color: #FD9731;
                }
                .gnb-btn-accent {
                    background: linear-gradient(90deg, rgba(253,151,49,0.18) 0%, rgba(207,106,5,0.18) 100%);
                    border-color: rgba(253,151,49,0.5);
                    color: #FD9731;
                }
                .gnb-btn-accent:hover,
                .gnb-btn-accent.is-active {
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
                        className={`gnb-btn${btn.accent ? ' gnb-btn-accent' : ''}${activeId === btn.id ? ' is-active' : ''}`}
                        aria-label={btn.label}
                        aria-current={activeId === btn.id ? 'true' : undefined}
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

import { detectPerfTier } from './utils/detectPerfTier';

export default function App() {
    const [loading, setLoading] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [introDone, setIntroDone] = useState(false);
    // ✅ Widoczność Canvas — opóźniona żeby dać WebGL czas na kompilację shaderów
    // i uniknąć żółtego rozbłysku z Bloom gdy kamera jest tuż przy globusie
    const [globeVisible, setGlobeVisible] = useState(false);
    // ✅ Tier wydajności: 'LOW' | 'MID' | 'HIGH'
    // Detekcja MUSI być w efekcie, nie w inicjalizatorze useState: inicjalizator odpala się
    // też przy renderze serwerowym, a detectPerfTier czyta navigator.hardwareConcurrency.
    // `null` do czasu detekcji; konsumenci są bramkowani niżej, więc globus i StarField nigdy
    // nie powstają z błędnym tierem (efekt leci w tym samym ticku co hydratacja, długo przed
    // przyjściem chunku WebGL, a Canvas czyta dpr/gl tylko przy tworzeniu).
    const [perfTier, setPerfTier] = useState(null);
    const isLowPerf = perfTier === 'LOW';
    const isHighPerf = perfTier === 'HIGH';

    useEffect(() => {
        setPerfTier(detectPerfTier());
    }, []);

    // Kursor: to samo — matchMedia nie istnieje na serwerze, a `false` na serwerze vs `true`
    // przy hydratacji dawało mismatch. CustomCursor jest i tak dynamiczny (ssr:false).
    const [showFinePointerCursor, setShowFinePointerCursor] = useState(false);

    useEffect(() => {
        setShowFinePointerCursor(window.matchMedia('(pointer: fine)').matches);
    }, []);

    const [geoDataRef, setGeoDataRef] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [activeGeometry, setActiveGeometry] = useState(null);
    const [focusPoint, setFocusPoint] = useState(null);
    const [hoverName, setHoverName] = useState(null);
    // Hover: w stanie trzymamy tylko to, co zmienia się przy WEJŚCIU / WYJŚCIU z kraju.
    // Wcześniej każdy pointermove nad krajem zapisywał nową tablicę współrzędnych (hoverGeometry)
    // i nowy obiekt pozycji myszy — React nie mógł pominąć renderu, więc przelatywał przez całe App,
    // 7 sekcji i scenę 3D przy KAŻDYM ruchu myszy. Geometria nie była nigdzie czytana poza
    // `Boolean(hoverGeometry)`, a pozycję tooltip czyta teraz sam (patrz Tooltip.jsx).
    const [isHoveringTarget, setIsHoveringTarget] = useState(false);
    const mousePosRef = useRef({ x: 0, y: 0 });

    // Scroll: postęp w refie + cztery progi w stanie. Konsumenci potrzebują tylko progów
    // (0.15 / 0.3 / 0.68) i dwóch przezroczystości, które ustawiamy bezpośrednio na elementach.
    // Wcześniej `scrollProgress` jako stan re-renderował App, 7 sekcji i scenę 3D ~40-57x/s scrolla.
    const [pastHero, setPastHero] = useState(false); //   > 0.15 — StarField pauza, ukrycie tekstu hero
    const [globeInert, setGlobeInert] = useState(false); // > 0.3  — globus przestaje łapać kursor
    const [globeIdle, setGlobeIdle] = useState(false); //   >= 0.68 — pętla WebGL w tryb 'demand'
    const scrollThresholdsRef = useRef({ pastHero: false, globeInert: false, globeIdle: false });
    const globeBoxRef = useRef(null);
    const uiLayerRef = useRef(null);

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
    // Pasek jest dekoracją (nie odzwierciedla realnego progresu), więc jego długość to czysty
    // koszt dodany do każdej wizyty: 1,2%/20 ms = 84 tiki = 1,68 s, plus 1,0 s fade = 2,68 s
    // zanim `isLoaded` odpali cokolwiek (kamerę, fetch geojson, montaż sekcji).
    // 2,4%/20 ms = 42 tiki = 0,84 s; z fade 0,4 s daje ~1,24 s. Krok jest całkowity w setnych,
    // więc pasek dowodliwie osiąga 100 — świadomie NIE przepinamy tego na wykładniczy lerp
    // do realnej gotowości, bo taki nigdy nie przekracza progu i loader wisi w nieskończoność.
    useEffect(() => {
        const i = setInterval(() => {
            setLoading(p => {
                if (p >= 100) { clearInterval(i); return 100; }
                return p + 2.4;
            });
        }, 20);
        return () => clearInterval(i);
    }, []);

    // ============ SIATKA BEZPIECZEŃSTWA dla isLoaded ============
    // `isLoaded` odpalał WYŁĄCZNIE z onAnimationComplete framer-motion, a ten jedzie na rAF.
    // W karcie w tle rAF nie tyka (klasyk: cmd-klik z wyników Google), więc loader mógł wisieć
    // dowolnie długo — a za nim stoi cała reszta: start kamery, fetch world.geojson i montaż
    // sekcji. setInterval liczący `loading` jest w tle tylko throttlowany do ~1 Hz, więc 100
    // osiąga zawsze; od tego momentu dajemy fade 0.4 s trzykrotny zapas i domykamy ręcznie.
    useEffect(() => {
        if (loading < 100 || isLoaded) return undefined;
        const t = setTimeout(() => setIsLoaded(true), 1200);
        return () => clearTimeout(t);
    }, [loading, isLoaded]);

    // ============ GLOBE VISIBILITY — opóźnione fade-in ============
    // Zapobiega żółtemu rozbłyskowi z Bloom gdy kamera startuje tuż przy globusie
    // Na LOW/mobile: dłuższe opóźnienie (shadery kompilują się wolniej)
    useEffect(() => {
        if (!isLoaded) return;
        const delay = isLowPerf ? 800 : isHighPerf ? 400 : 600;
        const t = setTimeout(() => setGlobeVisible(true), delay);
        return () => clearTimeout(t);
    }, [isLoaded, isLowPerf, isHighPerf]);

    // ============ PREFETCH CHUNKÓW SEKCJI — od razu, w czasie loadera ============
    // Wcześniej sekcje były bramkowane na `introDone` + 500 ms, czyli ~8,7 s na desktopie:
    // do tego momentu każda z siedmiu renderowała czarny div na 100vh, więc scroll w trakcie
    // intro nie pokazywał nic. Chunki pobieramy więc od razu (sieć w tym czasie stoi),
    // a montujemy je gdy loader zejdzie — patrz efekt poniżej.
    useEffect(() => {
        const t = setTimeout(() => {
            SECTION_IMPORTS.forEach((load) => {
                // Błąd pobrania nie może wywalić drzewa — `lazy()` i tak spróbuje ponownie
                // przy realnym renderze i wtedy pokaże się Suspense fallback.
                load().catch(() => {});
            });
        }, 150);
        return () => clearTimeout(t);
    }, []);

    // ============ MONTAŻ SEKCJI — gdy loader zejdzie, NIE po intro ============
    // Sekcje są pod foldem, więc ich montaż nie zmienia nic w tym, co widać (hero + globus),
    // ale sprawia, że scroll w trakcie intro trafia na prawdziwą treść.
    // ⚠️ Montujemy wszystkie naraz i trzymamy zamontowane: id="section-contact" żyje WEWNĄTRZ
    // ContactSection (wrapper ma "section-contact-wrap"), więc odmontowanie sekcji poza
    // viewportem psuje główny CTA nawigacji — getElementById zwraca null i klik jest zjadany.
    useEffect(() => {
        if (!isLoaded) return undefined;
        const t = setTimeout(() => setSectionsReady(true), 0);
        return () => clearTimeout(t);
    }, [isLoaded]);

    // ============ SCROLL HANDLER ============
    // Śledzi scroll przez Lenis ('app:scroll') + window fallback.
    // Przezroczystości piszemy prosto do DOM (bez Reacta), a setState wołamy tylko przy
    // przekroczeniu progu — porównanie z refem, żeby nie zlecać Reactowi nawet pustych aktualizacji.
    useEffect(() => {
        const update = (raw) => {
            const p = Math.min(raw / window.innerHeight, 1);
            if (globeBoxRef.current) globeBoxRef.current.style.opacity = String(Math.max(0, 1 - p * 1.5));
            if (uiLayerRef.current) uiLayerRef.current.style.opacity = String(Math.max(0, 1 - p * 2));

            const t = scrollThresholdsRef.current;
            const nextPastHero = p > 0.15;
            const nextGlobeInert = p > 0.3;
            const nextGlobeIdle = p >= 0.68;
            if (nextPastHero !== t.pastHero) { t.pastHero = nextPastHero; setPastHero(nextPastHero); }
            if (nextGlobeInert !== t.globeInert) { t.globeInert = nextGlobeInert; setGlobeInert(nextGlobeInert); }
            if (nextGlobeIdle !== t.globeIdle) { t.globeIdle = nextGlobeIdle; setGlobeIdle(nextGlobeIdle); }
        };
        const onLenis = (e) => update(e.detail);
        const onScroll = () => update(window.scrollY);
        window.addEventListener('app:scroll', onLenis);
        window.addEventListener('scroll', onScroll, { passive: true });
        update(window.scrollY);
        return () => {
            window.removeEventListener('app:scroll', onLenis);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const onOrbitInteractionEnd = useCallback(() => {
        setGlobeAutoSpinPaused(true);
    }, []);

    // Stabilna referencja — WebGLCanvas jest memo, a inline strzałka co render unieważniałaby memo.
    const handleIntroComplete = useCallback(() => {
        setIntroDone(true);
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
            // Normalizacja kąta do [-π, π] zapobiega akumulacji float przy długiej sesji
            const normalizedRot = normalizeAngle(rot);
            // `point` przychodzi jako THREE.Vector3 z eventu R3F — rotateAroundY czyta tylko x/y/z,
            // więc działa na obu reprezentacjach i zwraca zwykły obiekt.
            const corrected = rotateAroundY(point, -normalizedRot);
            // Hitbox sphere ma radius GLOBE_RADIUS+0.5 — używamy rzeczywistego promienia punktu
            // aby acos(y/r) był dokładny (bez tego błąd ~1° szerokości geograficznej)
            const hitRadius = pointLength(corrected);
            const { lat, lng } = pointToLatLng(corrected.x, corrected.y, corrected.z, hitRadius);
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
                const localPoint = centroid
                    ? latLngToPoint(centroid.lat, centroid.lng, GLOBE_RADIUS)
                    : latLngToPoint(validResult.lat, validResult.lng, GLOBE_RADIUS);
                // Punkt kraju jest w układzie GLOBUSA, a kamera potrzebuje układu ŚWIATA. Globus
                // obraca się sam (~1°/s do pierwszego najechania na kraj), więc bez tego obrotu kamera
                // leciała tam, gdzie kraj byłby przy rotacji 0 — po pół minuty oglądania hero klik
                // w USA pokazywał głównie ocean. `rot` to rotacja grupy w chwili kliknięcia (auto-obrót
                // jest wtedy wstrzymany, więc punkt pozostaje aktualny przez cały fokus).
                setFocusPoint(rotateAroundY(localPoint, normalizeAngle(rot)));
            } else {
                // handleClose inline
                setSelectedData(null);
                setActiveGeometry(null);
                setFocusPoint(null);
                setIsHoveringTarget(false);
                setIsGlobeInteracting(false);
            }
        } else if (type === 'HOVER') {
            if (!point) {
                setHoverName(null);
                setIsHoveringTarget(false);
                if (!selectedData) setIsGlobeInteracting(false);
                return;
            }
            if (validResult && event) {
                setGlobeAutoSpinPaused(true);
                const props = validResult.f.properties;
                const name = props.admin || props.name || props.name_long;
                setIsGlobeInteracting(true);
                // Pozycja do refa, nie do stanu — tooltip po zamontowaniu sam śledzi kursor.
                // Wszystkie setState poniżej mają tę samą wartość przy kolejnych ruchach nad tym
                // samym krajem, więc React je porzuca: render tylko przy zmianie kraju.
                mousePosRef.current = { x: event.clientX, y: event.clientY };
                setHoverName(COUNTRY_NAMES_PL[name] || name);
                setIsHoveringTarget(true);
            } else {
                setHoverName(null);
                setIsHoveringTarget(false);
            }
        }
    }, [introDone, geoDataRef, selectedData]);

    const handleClose = () => {
        setSelectedData(null);
        setActiveGeometry(null);
        setFocusPoint(null);
        setIsHoveringTarget(false);
        setIsGlobeInteracting(false);
    };

    // ============ SEKCJE — zmemoizowane ============
    // Sekcje nie przyjmują propsów, więc jedyną rzeczą, która może zmienić ich drzewo, jest
    // `sectionsReady`. Bez memo każdy render App (loader, zmiana kraju pod kursorem, próg scrolla,
    // klik w kraj) przelatywał przez wszystkie 7 sekcji — kilkaset elementów.
    const sectionsTree = useMemo(() => (
        <>
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
        </>
    ), [sectionsReady]);

    return (
        <>
            {showFinePointerCursor && <CustomCursor />}
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
                {perfTier && (
                    <StarField particleCount={isLowPerf ? 50 : isHighPerf ? 150 : 90} speed={0.2} paused={pastHero} />
                )}

                {/* HERO BACKGROUND */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100vh',
                    background: '#020203',
                    zIndex: 1
                }} />

                {/* ✅ GLOBUS
                    data-lenis-prevent-TOUCH, nie data-lenis-prevent. Pełny `data-lenis-prevent`
                    wyłączał Lenisowi także KÓŁKO nad globusem. Przy powrocie w górę, gdy scroll
                    schodził poniżej 0.3 i globus odzyskiwał pointerEvents, kolejne zdarzenia kółka
                    trafiały w globus: Lenis przestawał je przyjmować, ale przez ~0,7 s dogrywał
                    starą animację i trzymał pozycję (onNativeScroll ignoruje natywny scroll, dopóki
                    isScrolling === 'smooth'), po czym natywny scroll robił skok o cały „ząbek”
                    kółka, a Lenis go korygował. Zmierzone prawdziwymi zdarzeniami kółka: ~40 klatek
                    zamrożenia, potem -60 px i +55 px w dwóch klatkach — to było „szarpanie”.
                    Wyłączenie tylko dotyku zachowuje powód istnienia atrybutu: na tabletach
                    przeciąganie po globusie ma go obracać, a nie przewijać stronę. */}
                <div
                    ref={globeBoxRef}
                    data-lenis-prevent-touch
                    style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100vw', height: '100vh',
                    zIndex: 2,
                    pointerEvents: globeInert ? 'none' : 'auto',
                    /* 'none': Lenis + pan-y na tablecie przejmowały drugi gest (scroll) zamiast obrotu globusa */
                    touchAction: 'none',
                    // `opacity` NIE jest tutaj celowo: ustawia ją handler scrolla bezpośrednio na
                    // elemencie (globeBoxRef), 1 - progress × 1.5, bez transition. Gdyby była w tym
                    // obiekcie, każdy render App nadpisywałby wartość ze scrolla.
                }}>
                    {/* Fade startowy jest osobną warstwą: to jednorazowe 0→1 chroniące przed
                        rozbłyskiem Bloom i NIE może mieszać się z opacity od scrolla.
                        Dwie pomnożone przezroczystości dają ten sam efekt wizualny co wcześniej. */}
                    <div style={{
                        width: '100%', height: '100%',
                        opacity: globeVisible ? 1 : 0,
                        transition: 'opacity 1.2s ease-out',
                    }}>
                    {/* perfTier: Canvas czyta dpr/gl/antialias tylko przy tworzeniu, więc musi
                        powstać dopiero po detekcji tieru (jedna klatka po hydratacji). */}
                    {/* Wszystkie propsy są prymitywami albo stabilnymi referencjami (useCallback / ref),
                        więc memo na WebGLCanvas faktycznie pomija render sceny, gdy App się przerenderuje
                        z niezwiązanego powodu (np. loader, zmiana kraju pod kursorem). */}
                    {perfTier && <WebGLCanvas
                        perfTier={perfTier}
                        isLowPerf={isLowPerf}
                        isHighPerf={isHighPerf}
                        globeIdle={globeIdle}
                        introDone={introDone}
                        isLoaded={isLoaded}
                        focusPoint={focusPoint}
                        onIntroComplete={handleIntroComplete}
                        onGlobeEvent={handleGlobeEvent}
                        onOrbitInteractionEnd={onOrbitInteractionEnd}
                        globeRotation={globeRotation}
                        globeAutoSpinPaused={globeAutoSpinPaused}
                        hasHoverGeometry={isHoveringTarget}
                        hasActiveGeometry={Boolean(activeGeometry)}
                        hasFocusPoint={Boolean(focusPoint)}
                    />}
                    </div>
                </div>

                {/* ✅ LOADER — nad hero do końca animacji; potem isLoaded → null (strona widoczna) */}
                <Loader progress={loading} onComplete={() => setIsLoaded(true)} isLoaded={isLoaded} />

                {/* UI LAYER — pod loaderem do momentu isLoaded; potem pełny hero */}
                <div ref={uiLayerRef} style={{
                    position: 'relative',
                    zIndex: 10020,
                    pointerEvents: 'none',
                    // `opacity` ustawia handler scrolla bezpośrednio (uiLayerRef), 1 - progress × 2,
                    // bez transition — z tego samego powodu co przy kontenerze globusa.
                }}>
                    <div style={{ height: '100vh', position: 'relative' }}>
                        <HeroContent
                            hideHero={pastHero}
                            isGlobeInteracting={isGlobeInteracting}
                            introDone={introDone}
                        />
                    </div>

                    {hoverName && !selectedData && introDone && (
                        <Tooltip name={hoverName} initialPosRef={mousePosRef} />
                    )}
                </div>

                {sectionsTree}

            </SmoothScroll>

            {/* InfoPanel — poza divem z opacity aby uniknąć stacking context (opacity tworzy nowy) */}
            <AnimatePresence>
                {selectedData && <InfoPanel data={selectedData} onClose={handleClose} />}
            </AnimatePresence>
        </>
    );
}