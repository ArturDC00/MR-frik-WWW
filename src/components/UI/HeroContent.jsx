import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { LOGO_PATH } from '../../constants/config';

/**
 * Hero: logo + nagłówek dostępne od pierwszego renderu (nie czekają na intro 3D).
 * CTA i podpowiedzi globusa — po zakończeniu intro (introDone).
 */
/**
 * Rozmiary logo i typografii hero są w CSS (media query 767px), NIE w JS.
 *
 * Powód: hero renderuje się teraz na serwerze. Gdyby rozmiary zależały od `deviceType`
 * (czyli od window.innerWidth), serwer wysłałby wariant desktopowy, a telefon podmieniłby go
 * dopiero przy hydratacji — logo skakałoby z 240×170 na 180×128, i to na elemencie, który jest
 * kandydatem na LCP. Wartości poniżej są 1:1 tym, co renderował dotychczasowy JS na każdym
 * breakpoincie. `deviceType` został tylko dla CTA i podpowiedzi scrolla — oba są bramkowane
 * na `introDone`, więc pojawiają się sekundy później i nie mogą wywołać mismatchu.
 */
const HERO_CSS = `
.hero-logo-wrap { position: absolute; top: 24px; left: 32px; pointer-events: none; z-index: 20; }
.hero-logo { width: 240px; height: auto; object-fit: contain; object-position: left center; }
.hero-title {
    font-family: 'Monument Extended', sans-serif;
    font-size: clamp(48px, 5vw, 82px);
    line-height: 1.2; font-weight: 800; color: #F5F5F5;
    margin: 0 auto; padding: 0; max-width: 90%;
    background: linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%);
    background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    text-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.hero-subtitle {
    font-family: 'Inter', sans-serif;
    font-size: clamp(18px, 2vw, 24px);
    line-height: 1.6; font-weight: 400; color: rgba(255,255,255,0.85);
    margin: 24px auto 0; padding: 0; max-width: 600px;
}
@media (max-width: 767px) {
    .hero-logo-wrap { top: 16px; left: 16px; }
    .hero-logo { width: 180px; }
    .hero-title { font-size: clamp(32px, 8vw, 48px); }
    .hero-subtitle { font-size: clamp(16px, 4vw, 20px); }
}
`;

/** `hideHero` = strona przewinięta za 15% ekranu (próg liczony w App, bez re-renderu na każdy tick). */
export function HeroContent({ hideHero, isGlobeInteracting, introDone }) {
    // Startuje na 'DESKTOP' i na serwerze, i przy pierwszym renderze klienta — zero mismatchu.
    // Realną wartość ustawia efekt poniżej; dotyczy wyłącznie CTA i podpowiedzi scrolla.
    const [deviceType, setDeviceType] = useState('DESKTOP');

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setDeviceType('MOBILE');
            else if (window.innerWidth < 1024) setDeviceType('TABLET');
            else setDeviceType('DESKTOP');
        };

        // Ustaw realny typ od razu po hydratacji — bez tego telefon zostawał na 'DESKTOP' aż do
        // pierwszego resize (CTA w rozmiarach desktopowych i desktopowa podpowiedź zamiast strzałki).
        handleResize();

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    const shouldHide = hideHero || isGlobeInteracting;

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}
        >
            <style>{HERO_CSS}</style>

            {/* Logo — statyczny, od razu (LCP): bez opóźnień motion.
                width/height dają stały aspect-ratio, CSS ustala szerokość na breakpoint —
                dzięki temu nie ma przeskoku po hydratacji. */}
            <div className="hero-logo-wrap">
                <Image
                    src={LOGO_PATH}
                    alt="MrFrik — Import samochodów z USA i Kanady"
                    width={240}
                    height={170}
                    className="hero-logo"
                    priority
                    /* unoptimized: preload w layout.jsx wskazuje surowy PNG, a next/image
                       pytałby o /_next/image?url=... — preload leciał więc w próżnię (6,5 KB
                       zmarnowane na krytycznej ścieżce). Źródło ma 560×396 i 6 507 B, czyli
                       MNIEJ niż generowany z niego AVIF (7 066 B), a render to 180-240 px.
                       Efekt: jedno żądanie, trafiony preload, zero transformacji sharp na VPS. */
                    unoptimized
                />
            </div>

            <AnimatePresence>
                {!shouldHide && (
                    <motion.div
                        key="hero-copy"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35 }}
                        style={{
                            textAlign: 'center',
                            zIndex: 10,
                            padding: '0 20px',
                        }}
                    >
                        <h1 className="hero-title">Import aut z USA i Kanady</h1>
                        <p className="hero-subtitle">
                            Oszczędź nawet 40% w porównaniu do cen europejskich
                        </p>

                        {introDone && (
                            <motion.button
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                whileHover={{ scale: deviceType === 'DESKTOP' ? 1.05 : 1 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    marginTop: deviceType === 'MOBILE' ? '32px' : '48px',
                                    minHeight: '44px',
                                    padding: deviceType === 'MOBILE' ? '14px 32px' : '16px 48px',
                                    fontSize: deviceType === 'MOBILE' ? '16px' : '18px',
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: '600',
                                    color: '#FD9731',
                                    background: 'linear-gradient(135deg, #0d1d3e 0%, #102044 50%, #162d5a 100%)',
                                    border: '1px solid rgba(253, 151, 49, 0.35)',
                                    borderRadius: '100px',
                                    cursor: 'pointer',
                                    pointerEvents: 'auto',
                                    boxShadow:
                                        '0 8px 32px rgba(16, 32, 68, 0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                                    transition: 'all 0.3s ease',
                                }}
                                onClick={() => {
                                    const el = document.getElementById('section-process');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Rozpocznij import
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {introDone && !shouldHide && deviceType !== 'MOBILE' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    style={{
                        position: 'absolute',
                        bottom: '120px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '16px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontFamily: 'Inter, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <motion.span
                        aria-hidden="true"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        ↓
                    </motion.span>
                    Przewiń lub kliknij kraje na globusie
                </motion.div>
            )}

            {introDone && !shouldHide && deviceType === 'MOBILE' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    style={{
                        position: 'absolute',
                        bottom: '60px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    <motion.span
                        aria-hidden="true"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        ↓
                    </motion.span>
                </motion.div>
            )}
        </div>
    );
}
