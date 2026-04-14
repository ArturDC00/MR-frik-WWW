import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants/colors';
import { getCarInfo } from '../../constants/carDatabase';

const WA_LINK = 'https://wa.me/48798916868?text=Cześć,%20chciałbym%20dowiedzieć%20się%20więcej%20o%20imporcie%20auta%20z%20USA%20lub%20Kanady.';

// ── Ikony inline ──────────────────────────────────────────────
function IconPin() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
    );
}
function IconHammer() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
    );
}
function IconCar() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
    );
}
function IconAnchor() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
        </svg>
    );
}
function IconHome() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    );
}

// ── Sekcja z nagłówkiem ───────────────────────────────────────
function Section({ icon, label, children }) {
    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '8px',
            }}>
                <span style={{ color: COLORS.gradientEnd }}>{icon}</span>
                {label}
            </div>
            {children}
        </div>
    );
}

// ── Lista miast / aukcji jako tagi ────────────────────────────
function TagList({ items, accent }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {items.map((item, i) => (
                <span key={i} style={{
                    padding: '4px 10px',
                    borderRadius: '100px',
                    background: accent
                        ? 'rgba(253,151,49,0.1)'
                        : 'rgba(255,255,255,0.06)',
                    border: accent
                        ? '1px solid rgba(253,151,49,0.25)'
                        : '1px solid rgba(255,255,255,0.1)',
                    color: accent ? '#FD9731' : 'rgba(255,255,255,0.75)',
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'Inter, sans-serif',
                    whiteSpace: 'nowrap',
                }}>
                    {item}
                </span>
            ))}
        </div>
    );
}

// ── Główny komponent ──────────────────────────────────────────
export function InfoPanel({ data, onClose }) {
    if (!data) return null;
    const info = getCarInfo(data.name);
    if (!info) return null;

    const isExport = info.type === 'export';
    const isTransit = info.type === 'transit';
    const isDestination = info.type === 'destination';

    // Etykieta nagłówka zależna od typu
    const typeLabel = isExport ? 'IMPORT Z' : isTransit ? 'TRANZYT PRZEZ' : 'DOSTAWA DO';
    const flagSrc = {
        "United States of America": '/flags/us.png',
        "United States":            '/flags/us.png',
        "Canada":                   '/flags/ca.png',
        "Netherlands":              '/flags/nl.png',
        "Germany":                  '/flags/de.png',
        "Poland":                   '/flags/pl.png',
    }[data.name] || null;

    return (
        <>
            <style>{`
                @media (max-width: 639px) {
                    .info-panel-outer {
                        top: 50% !important;
                        left: 50% !important;
                        bottom: auto !important;
                        right: auto !important;
                        transform: translate(-50%, -50%) !important;
                        width: calc(100vw - 32px) !important;
                    }
                    .info-panel-inner {
                        width: 100% !important;
                        border-radius: 22px !important;
                        max-height: 80vh !important;
                        overflow-y: auto !important;
                    }
                }
            `}</style>

            <div className="info-panel-outer" style={{
                position: 'fixed',
                bottom: '32px',
                right: '24px',
                zIndex: 200,
                pointerEvents: 'auto',
            }}>
                <motion.div
                    className="info-panel-inner"
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                    style={{
                        width: 'clamp(340px, 28vw, 440px)',
                        background: 'rgba(6, 8, 18, 0.96)',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        border: `1px solid rgba(253,151,49,0.2)`,
                        borderRadius: '22px',
                        color: '#fff',
                        overflow: 'hidden',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                >
                    {/* ── Header ── */}
                    <div style={{
                        padding: '18px 20px 16px',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        background: 'linear-gradient(135deg, rgba(253,151,49,0.05) 0%, transparent 60%)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {flagSrc ? (
                                <img
                                    src={flagSrc}
                                    alt={`Flaga ${data.name}`}
                                    width={44}
                                    height={30}
                                    loading="lazy"
                                    decoding="async"
                                    style={{
                                        width: '44px',
                                        height: 'auto',
                                        borderRadius: '5px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                        flexShrink: 0,
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: '32px', lineHeight: 1 }}>🌍</span>
                            )}
                            <div>
                                <div style={{
                                    fontSize: '9px',
                                    color: COLORS.gradientEnd,
                                    letterSpacing: '2.5px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    marginBottom: '3px',
                                    fontFamily: 'Inter, sans-serif',
                                }}>
                                    {typeLabel}
                                </div>
                                <h2 style={{
                                    margin: 0,
                                    fontSize: 'clamp(20px, 2vw, 24px)',
                                    fontWeight: 700,
                                    fontFamily: 'Inter, sans-serif',
                                    lineHeight: 1.2,
                                    color: '#fff',
                                }}>
                                    {data.namePl || (data.name === 'United States of America' ? 'USA' : data.name)}
                                </h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Zamknij"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.6)',
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(253,151,49,0.15)';
                                e.currentTarget.style.borderColor = 'rgba(253,151,49,0.4)';
                                e.currentTarget.style.color = '#FD9731';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* ── Body ── */}
                    <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* EXPORT: Skąd importujemy + Gdzie kupujemy + Marki */}
                        {isExport && (
                            <>
                                <Section icon={<IconPin />} label="Skąd importujemy?">
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                        <TagList items={info.cities} />
                                        {info.citiesNote && (
                                            <span style={{
                                                fontSize: '12px',
                                                color: 'rgba(255,255,255,0.35)',
                                                fontStyle: 'italic',
                                                fontFamily: 'Inter, sans-serif',
                                            }}>
                                                {info.citiesNote}
                                            </span>
                                        )}
                                    </div>
                                </Section>

                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                                <Section icon={<IconHammer />} label="Gdzie kupujemy?">
                                    <TagList items={info.auctions} />
                                </Section>

                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                                <Section icon={<IconCar />} label="Najpopularniejsze marki i modele">
                                    <TagList items={info.brands} accent />
                                </Section>
                            </>
                        )}

                        {/* TRANSIT: Porty + opis */}
                        {isTransit && (
                            <>
                                <Section icon={<IconAnchor />} label="Porty">
                                    <TagList items={info.ports} accent />
                                </Section>

                                <div style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '14px',
                                    padding: '14px 16px',
                                }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '13px',
                                        color: 'rgba(203,213,225,0.85)',
                                        lineHeight: '1.7',
                                        fontFamily: 'Inter, sans-serif',
                                    }}>
                                        {info.description}
                                    </p>
                                </div>
                            </>
                        )}

                        {/* DESTINATION: opis */}
                        {isDestination && (
                            <>
                                <Section icon={<IconHome />} label="Dostawa">
                                    <div style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: '14px',
                                        padding: '14px 16px',
                                    }}>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '13px',
                                            color: 'rgba(203,213,225,0.85)',
                                            lineHeight: '1.7',
                                            fontFamily: 'Inter, sans-serif',
                                        }}>
                                            {info.description}
                                        </p>
                                    </div>
                                </Section>
                            </>
                        )}

                        {/* CTA — tylko dla krajów eksportowych */}
                        {isExport && (
                            <a
                                href={WA_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #FD9731 0%, #CF6A05 100%)',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 20px rgba(253,151,49,0.35)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(253,151,49,0.5)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(253,151,49,0.35)';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 32 32" fill="white">
                                    <path d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16c0 2.353.629 4.558 1.727 6.462L2.667 29.333l7.09-1.698A13.267 13.267 0 0016 29.333c7.364 0 13.333-5.97 13.333-13.333S23.364 2.667 16 2.667z"/>
                                </svg>
                                Zapytaj o import
                            </a>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
}
