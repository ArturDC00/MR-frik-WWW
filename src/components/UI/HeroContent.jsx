import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { LOGO_PATH } from '../../constants/config';

/**
 * Hero: logo + nagłówek dostępne od pierwszego renderu (nie czekają na intro 3D).
 * CTA i podpowiedzi globusa — po zakończeniu intro (introDone).
 */
export function HeroContent({ scrollProgress, isGlobeInteracting, introDone }) {
    const [deviceType, setDeviceType] = useState(() => {
        if (typeof window === 'undefined') return 'DESKTOP';
        if (window.innerWidth < 768) return 'MOBILE';
        if (window.innerWidth < 1024) return 'TABLET';
        return 'DESKTOP';
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setDeviceType('MOBILE');
            else if (window.innerWidth < 1024) setDeviceType('TABLET');
            else setDeviceType('DESKTOP');
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    const shouldHide = scrollProgress > 0.15 || isGlobeInteracting;

    const titleStyles = {
        fontFamily: 'Monument Extended, sans-serif',
        fontSize: deviceType === 'MOBILE' ? 'clamp(32px, 8vw, 48px)' : 'clamp(48px, 5vw, 82px)',
        lineHeight: '1.2',
        fontWeight: '800',
        color: '#F5F5F5',
        margin: '0 auto',
        padding: '0',
        maxWidth: '90%',
        background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
    };

    const subtitleStyles = {
        fontFamily: 'Inter, sans-serif',
        fontSize: deviceType === 'MOBILE' ? 'clamp(16px, 4vw, 20px)' : 'clamp(18px, 2vw, 24px)',
        lineHeight: '1.6',
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.85)',
        margin: '24px auto 0',
        padding: '0',
        maxWidth: '600px',
    };

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
            {/* Logo — statyczny, od razu (LCP): bez opóźnień motion */}
            <div
                style={{
                    position: 'absolute',
                    top: deviceType === 'MOBILE' ? '16px' : '24px',
                    left: deviceType === 'MOBILE' ? '16px' : '32px',
                    pointerEvents: 'none',
                    zIndex: 20,
                }}
            >
                <Image
                    src={LOGO_PATH}
                    alt="MrFrik — Import samochodów z USA i Kanady"
                    width={deviceType === 'MOBILE' ? 180 : 240}
                    height={deviceType === 'MOBILE' ? 128 : 170}
                    sizes="(max-width: 767px) 180px, 240px"
                    style={{ objectFit: 'contain', objectPosition: 'left center' }}
                    priority
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
                        <h1 style={titleStyles}>Import aut z USA i Kanady</h1>
                        <p style={subtitleStyles}>
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
