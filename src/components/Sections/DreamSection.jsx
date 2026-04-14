import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// GLASS CARD — lewy panel z contentem
// ============================================================
const glassCardStyles = `
    .dream-glass-card {
        position: absolute;
        left: 16px;
        right: 16px;
        top: 50%;
        transform: translateY(calc(-50% + 16px)) scale(0.96);
        width: calc(100% - 32px);
        border-radius: 20px;
        border: 1px solid rgba(247, 247, 247, 0.18);
        background: rgba(10, 15, 30, 0.78);
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        padding: 24px;
        opacity: 0;
        transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                    transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 50;
    }
    .dream-glass-card.active {
        opacity: 1;
        transform: translateY(-50%) scale(1);
        pointer-events: auto;
    }
    .dream-glass-title {
        color: #F5F5F5;
        text-align: left;
        font-family: Inter, sans-serif;
        font-size: clamp(18px, 2.4vw, 26px);
        font-weight: 700;
        line-height: 1.3;
        margin: 0;
    }
    .dream-glass-subtitle {
        color: rgba(245,245,245,0.72);
        text-align: left;
        font-family: Inter, sans-serif;
        font-size: clamp(14px, 1.4vw, 16px);
        font-weight: 400;
        line-height: 1.65;
        margin: 0;
    }
    @media (min-width: 768px) {
        .dream-glass-card {
            left: 40px;
            right: auto;
            width: clamp(300px, 40vw, 500px);
            border-radius: 22px;
            padding: 28px 32px;
            gap: 14px;
        }
    }
    @media (min-width: 1024px) {
        .dream-glass-card {
            left: 72px;
            width: clamp(340px, 38vw, 540px);
            padding: 32px 40px;
        }
    }

    @keyframes dreamKenBurns {
        from { transform: scale(1.08); }
        to   { transform: scale(1.0); }
    }
    .dream-bg-img {
        animation: dreamKenBurns 12s ease-out forwards;
    }
`;

function GlassCard({ step, active }) {
    const content = {
        3: {
            title: "Pełna transparentność",
            subtitle: "Dostęp do wszystkich kosztów i raportów Carfax.",
        },
        4: {
            title: "Kompleksowa obsługa",
            subtitle: "Od aukcji po rejestrację w Polsce — zajmujemy się wszystkim.",
        },
        5: {
            title: "Realne wsparcie ekspertów",
            subtitle: "Nasz zespół doradców pomoże Ci na każdym etapie importu.",
        }
    };

    const data = content[step];
    if (!data) return null;

    return (
        <>
            <style>{glassCardStyles}</style>
            <div className={`dream-glass-card${active ? ' active' : ''}`}>
                <h3 className="dream-glass-title">{data.title}</h3>
                {data.subtitle && (
                    <p className="dream-glass-subtitle">{data.subtitle}</p>
                )}
            </div>
        </>
    );
}

// ============================================================
// MAIN COMPONENT — cinematic photo, brak 3D Canvas
// ============================================================
export const DreamSection = React.memo(function DreamSection() {
    const sectionRef = useRef();
    const scrollTriggerRef = useRef(null);
    const isMountedRef = useRef(false);
    const [scrollState, setScrollState] = useState(0);
    const [activeCard, setActiveCard] = useState(null);

    useEffect(() => {
        if (isMountedRef.current) return;
        const section = sectionRef.current;
        if (!section) return;
        isMountedRef.current = true;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=3500',
                pin: true,
                scrub: 0.5,
                anticipatePin: 1,
                onUpdate: (self) => {
                    const state = self.progress * 5;
                    setScrollState(state);
                    if (state >= 3 && state < 4)        setActiveCard(3);
                    else if (state >= 4 && state < 4.5) setActiveCard(4);
                    else if (state >= 4.5)              setActiveCard(5);
                    else                                setActiveCard(null);
                },
            }
        });

        scrollTriggerRef.current = tl;

        return () => {
            scrollTriggerRef.current?.kill();
            scrollTriggerRef.current = null;
            isMountedRef.current = false;
        };
    }, []);

    return (
        <div
            ref={sectionRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                background: '#000',
                overflow: 'hidden',
            }}
        >
            {/* ── CINEMATIC BACKGROUND ─────────────────────────── */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <Image
                    src="/Photo/FRIK_ najnowsze Porsche 911 Turbo S_.webp"
                    alt="Import samochodu z USA i Kanady — MrFrik"
                    fill
                    className="dream-bg-img"
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center 60%',
                        opacity: 0.75,
                    }}
                    priority
                />
                {/* Vignette + dark gradient */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `
                        radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%),
                        linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(2,2,3,0.75) 100%)
                    `,
                }} />
            </div>

            {/* ── TEXT OVERLAYS ────────────────────────────────── */}
            {scrollState < 1.5 && (
                <h2 style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'Monument Extended, sans-serif',
                    fontSize: 'clamp(32px, 5.5vw, 82px)',
                    fontWeight: '400',
                    lineHeight: '1.2',
                    letterSpacing: '0.04em',
                    background: 'linear-gradient(90deg, rgba(247,247,247,0.65) 0%, #FFF 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    padding: '0 20px',
                    opacity: Math.max(0, 1 - scrollState * 2),
                    pointerEvents: 'none',
                    zIndex: 10,
                    textShadow: 'none',
                    whiteSpace: 'nowrap',
                }}>
                    Marzenie z Ameryki...
                </h2>
            )}

            {scrollState >= 1 && scrollState < 2.5 && (
                <h2 style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'Monument Extended, sans-serif',
                    fontSize: 'clamp(28px, 5vw, 82px)',
                    fontWeight: '400',
                    lineHeight: '1.2',
                    letterSpacing: '0.04em',
                    background: 'linear-gradient(90deg, rgba(247,247,247,0.65) 0%, #FFF 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    padding: '0 20px',
                    opacity: Math.max(0, 1 - Math.abs(scrollState - 1.5) * 2),
                    pointerEvents: 'none',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                }}>
                    ...staje się realnym planem.
                </h2>
            )}

            {scrollState >= 1.8 && scrollState < 3.5 && (
                <h2 style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontFamily: 'Monument Extended, sans-serif',
                    fontSize: 'clamp(34px, 5.8vw, 88px)',
                    fontWeight: '800',
                    lineHeight: '1.25',
                    letterSpacing: '0.03em',
                    background: 'linear-gradient(90deg, rgba(247,247,247,0.85) 0%, #FFF 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    padding: '0 24px',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    opacity: Math.max(0, Math.min(
                        (scrollState - 1.8) * 2,
                        (3.5 - scrollState) * 2
                    )),
                    pointerEvents: 'none',
                    zIndex: 10,
                }}>
                    Dlaczego setki klientów<br />wybrało nas?
                </h2>
            )}

            {/* ── GLASS CARDS ──────────────────────────────────── */}
            <GlassCard step={3} active={activeCard === 3} />
            <GlassCard step={4} active={activeCard === 4} />
            <GlassCard step={5} active={activeCard === 5} />
        </div>
    );
});
