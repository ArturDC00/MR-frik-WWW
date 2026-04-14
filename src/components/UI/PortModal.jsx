import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants/colors';

/* Wspólny styl "panel overlay" — ta sama baza co InfoPanel */
const PANEL_BG = 'rgba(5, 8, 15, 0.95)';
const PANEL_BORDER = `1.5px solid ${COLORS.gradientEnd}`;
const PANEL_BLUR = 'blur(40px)';

export function PortModal({ port, onClose }) {
    if (!port) return null;

    const mapEmbedUrl = `https://maps.google.com/maps?q=${port.lat},${port.lng}&t=k&z=14&ie=UTF8&iwloc=&output=embed`;

    return (
        /* Backdrop overlay */
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                zIndex: 2000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(2,2,3,0.72)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
                style={{
                    width: 'min(80vw, 1100px)',
                    height: 'min(80vh, 700px)',
                    background: PANEL_BG,
                    backdropFilter: PANEL_BLUR,
                    WebkitBackdropFilter: PANEL_BLUR,
                    border: PANEL_BORDER,
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: `0 40px 120px rgba(0,0,0,0.95), 0 0 80px ${COLORS.gradientEnd}30`,
                }}
            >
                {/* Header — spójny z InfoPanel */}
                <div style={{
                    padding: '18px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    flexShrink: 0,
                }}>
                    <div>
                        <div style={{
                            fontSize: '10px',
                            color: COLORS.gradientEnd,
                            letterSpacing: '2px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                        }}>
                            LIVE SATELLITE FEED
                        </div>
                        <h2 style={{
                            margin: '6px 0 0',
                            fontFamily: 'Monument Extended, sans-serif',
                            fontSize: 'clamp(18px, 2vw, 26px)',
                            fontWeight: 800,
                            color: '#fff',
                            lineHeight: 1.1,
                        }}>
                            {port.name}
                        </h2>
                    </div>

                    {/* Okrągły przycisk zamknięcia — spójny z InfoPanel */}
                    <button
                        onClick={onClose}
                        aria-label="Zamknij"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#fff',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            lineHeight: 1,
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(253,151,49,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        ✕
                    </button>
                </div>

                {/* Content: Mapa + Sidebar */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

                    {/* Mapa satellite */}
                    <div style={{ flex: 2, position: 'relative', borderRight: '1px solid rgba(255,255,255,0.08)', minWidth: 0 }}>
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                            title={`Mapa portu ${port.name}`}
                            src={mapEmbedUrl}
                            style={{ display: 'block', filter: 'grayscale(20%) contrast(1.1)' }}
                        />
                        {/* Scanline overlay */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            pointerEvents: 'none',
                            background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(253,151,49,0.03) 3px, rgba(253,151,49,0.03) 4px)`,
                            opacity: 0.6,
                        }} />
                    </div>

                    {/* Sidebar info — spójny styl z InfoPanel info-box */}
                    <div style={{
                        flex: 1,
                        padding: '24px',
                        background: 'rgba(2,2,3,0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                        minWidth: '220px',
                        maxWidth: '300px',
                        overflowY: 'auto',
                    }}>
                        <div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
                            <div style={{ color: '#25D366', fontWeight: 700, fontSize: '14px' }}>● OPERATIONAL</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Współrzędne</div>
                            <div style={{ fontFamily: 'monospace', color: '#fff', fontSize: '13px' }}>
                                {port.lat.toFixed(4)}°, {port.lng.toFixed(4)}°
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Info</div>
                            <p style={{ fontSize: '13px', lineHeight: '1.65', color: 'rgba(203,213,225,0.85)', margin: 0 }}>
                                {port.description}
                            </p>
                        </div>

                        <a
                            href={port.googleEarthUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '12px 16px',
                                background: `linear-gradient(90deg, ${COLORS.gradientEnd} -2%, #CF6A05 116.4%)`,
                                color: '#000',
                                textAlign: 'center',
                                textDecoration: 'none',
                                fontWeight: 700,
                                borderRadius: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '12px',
                                display: 'block',
                                transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            Open Full Earth
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
