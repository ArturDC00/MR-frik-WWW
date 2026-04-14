import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

// ============================================================
// PLATFORM MrFrik — 2 slajdy
// Slajd 1: Opis platformy + mockup browser
// Slajd 2: Kalkulator + mockup phone (mirrored)
// ============================================================

const SECTION_BG = '#020203';
const ORANGE = '#FD9731';

// ── Ikony SVG (stroke style spójny z całą stroną) ───────────
function IconLocation() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
    );
}
function IconFile() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>
    );
}
function IconContract() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    );
}
function IconPhone() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
    );
}
function IconCalculator() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="8" y2="10"/>
            <line x1="12" y1="10" x2="12" y2="10"/>
            <line x1="16" y1="10" x2="16" y2="10"/>
            <line x1="8" y1="14" x2="8" y2="14"/>
            <line x1="12" y1="14" x2="12" y2="14"/>
            <line x1="16" y1="14" x2="16" y2="14"/>
            <line x1="8" y1="18" x2="12" y2="18"/>
            <line x1="16" y1="18" x2="16" y2="18"/>
        </svg>
    );
}

// ── Slajd 1 ─────────────────────────────────────────────────
function Slide1() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.2 });

    const features = [
        { icon: <IconLocation />, label: 'Status transportu' },
        { icon: <IconFile />, label: 'Dokumenty' },
        { icon: <IconContract />, label: 'Umowy' },
        { icon: <IconCalculator />, label: 'Kalkulator kosztów' },
        { icon: <IconPhone />, label: 'Kontakt z ekspertem' },
    ];

    return (
        <section
            ref={ref}
            style={{
                width: '100%',
                minHeight: '100vh',
                background: SECTION_BG,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(80px, 10vh, 140px) clamp(20px, 6%, 100px)',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Delikatna poświata w tle */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '5%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(253,151,49,0.06) 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%',
                maxWidth: '1500px',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(40px, 5%, 80px)',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Lewa: tekst */}
                <div style={{ flex: '1 1 320px', maxWidth: '500px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div style={{
                            fontSize: '11px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            color: ORANGE,
                            marginBottom: '16px',
                        }}>
                            CENTRUM IMPORTU MRFRIK
                        </div>

                        <h2 style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 'clamp(28px, 3.5vw, 52px)',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: '#F5F5F5',
                            margin: '0 0 24px',
                        }}>
                            Import samochodu jeszcze nigdy nie był tak prosty
                        </h2>

                        <p style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 'clamp(15px, 1.4vw, 18px)',
                            lineHeight: 1.7,
                            color: 'rgba(245,245,245,0.72)',
                            margin: '0 0 36px',
                        }}>
                            Jako nasz klient otrzymasz dostęp do Centrum Importu MrFrik. Wszystkie etapy importu auta z USA lub Kanady w jednym miejscu. Dokumenty, umowy, status transportu i wbudowany kalkulator kosztów – pełna kontrola i przejrzystość finansowa w zasięgu ręki.
                        </p>

                        {/* Feature pills z SVG */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '40px' }}>
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                                    transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 16px',
                                        borderRadius: '100px',
                                        background: 'rgba(253,151,49,0.08)',
                                        border: '1px solid rgba(253,151,49,0.2)',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: 'rgba(245,245,245,0.85)',
                                    }}
                                >
                                    <span style={{ color: ORANGE, display: 'flex', alignItems: 'center' }}>{f.icon}</span>
                                    {f.label}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Prawa: mockup browser — duży */}
                <motion.div
                    initial={{ opacity: 0, x: 40, scale: 0.96 }}
                    animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 40, scale: 0.96 }}
                    transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 80 }}
                    style={{
                        flex: '1 1 460px',
                        maxWidth: '900px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image
                        src="/Photo/Frik_Mockup_apka_browser.webp"
                        alt="Platforma MrFrik — panel klienta"
                        width={3755}
                        height={2372}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            filter: 'drop-shadow(0 40px 100px rgba(0,0,0,0.7))',
                            borderRadius: '12px',
                        }}
                    />
                </motion.div>
            </div>
        </section>
    );
}

// ── Slajd 2 ─────────────────────────────────────────────────
function Slide2() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.2 });

    return (
        <section
            ref={ref}
            style={{
                width: '100%',
                minHeight: '100vh',
                background: SECTION_BG,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(80px, 10vh, 140px) clamp(20px, 6%, 100px)',
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
        >
            {/* Delikatna poświata w tle — prawa strona */}
            <div style={{
                position: 'absolute',
                bottom: '15%',
                right: '5%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(253,151,49,0.06) 0%, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%',
                maxWidth: '960px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(32px, 4%, 64px)',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 1,
                margin: '0 auto',
            }}>
                {/* Lewa: mockup */}
                <motion.div
                    initial={{ opacity: 0, x: -40, scale: 0.96 }}
                    animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -40, scale: 0.96 }}
                    transition={{ delay: 0.15, duration: 0.8, type: 'spring', stiffness: 80 }}
                    style={{
                        flex: '0 0 auto',
                        width: 'min(340px, 45%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image
                        src="/Photo/Glowna/352794524_75418f97-ace1-4200-a0e2-f44fd3da7a15.webp"
                        alt="Platforma MrFrik — kalkulator kosztów importu"
                        width={1800}
                        height={1252}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            filter: 'drop-shadow(0 40px 100px rgba(0,0,0,0.7))',
                            borderRadius: '12px',
                        }}
                    />
                </motion.div>

                {/* Prawa: tekst + CTA */}
                <div style={{ flex: '1 1 260px', maxWidth: '420px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div style={{
                            fontSize: '11px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            color: ORANGE,
                            marginBottom: '16px',
                        }}>
                            DOSTĘPNY DLA KAŻDEGO
                        </div>

                        <h2 style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 'clamp(28px, 3.5vw, 52px)',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: '#F5F5F5',
                            margin: '0 0 24px',
                        }}>
                            Kalkulator kosztów importu
                        </h2>

                        <p style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: 'clamp(15px, 1.4vw, 18px)',
                            lineHeight: 1.7,
                            color: 'rgba(245,245,245,0.72)',
                            margin: '0 0 36px',
                        }}>
                            Odwiedź naszą platformę i sprawdź kalkulator kosztów importu – dostępny również dla gości.<br /><br />Oblicz, ile naprawdę będzie kosztować Twój samochód marzeń z USA lub Kanady.
                        </p>

                        <motion.a
                            href="https://app.mrfrik.pl"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Sprawdź kalkulator kosztów importu na platformie MrFrik"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '14px 32px',
                                borderRadius: '100px',
                                background: `linear-gradient(135deg, ${ORANGE} 0%, #CF6A05 100%)`,
                                color: '#fff',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '16px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                boxShadow: '0 4px 24px rgba(253,151,49,0.35)',
                                transition: 'box-shadow 0.2s ease',
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                            Sprawdź
                        </motion.a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ── Main ─────────────────────────────────────────────────────
export function PlatformSection() {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                background: SECTION_BG,
            }}
        >
            <Slide1 />
            <Slide2 />
        </div>
    );
}
