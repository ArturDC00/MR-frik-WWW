import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '../../constants/colors';

export function AmbientSound({ play }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const fadeInRef = useRef(null);
    const fadeOutRef = useRef(null);

    // Inicjalizacja audio — tylko raz
    useEffect(() => {
        const audio = new Audio('/Audio/the_mountain-space-438391.mp3');
        audio.loop = true;
        audio.volume = 0;
        audioRef.current = audio;

        return () => {
            clearInterval(fadeInRef.current);
            clearInterval(fadeOutRef.current);
            audio.pause();
            audio.src = '';
        };
    }, []);

    // Pokaż przycisk gdy strona gotowa
    useEffect(() => {
        if (play) setIsVisible(true);
    }, [play]);

    const clearFades = () => {
        if (fadeInRef.current) { clearInterval(fadeInRef.current); fadeInRef.current = null; }
        if (fadeOutRef.current) { clearInterval(fadeOutRef.current); fadeOutRef.current = null; }
    };

    const fadeIn = () => {
        const audio = audioRef.current;
        if (!audio) return;
        clearFades();
        audio.volume = 0;
        audio.play().then(() => {
            setIsPlaying(true);
            fadeInRef.current = setInterval(() => {
                if (audio.volume < 0.38) {
                    audio.volume = Math.min(audio.volume + 0.04, 0.4);
                } else {
                    audio.volume = 0.4;
                    clearInterval(fadeInRef.current);
                    fadeInRef.current = null;
                }
            }, 80);
        }).catch(() => {
            // Autoplay zablokowany — nic nie robimy, przycisk nadal widoczny
        });
    };

    const fadeOut = () => {
        const audio = audioRef.current;
        if (!audio) return;
        clearFades();
        fadeOutRef.current = setInterval(() => {
            if (audio.volume > 0.04) {
                audio.volume = Math.max(audio.volume - 0.04, 0);
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeOutRef.current);
                fadeOutRef.current = null;
                setIsPlaying(false);
            }
        }, 50);
    };

    // Toggle: klik = play/pause — BRAK auto-restart
    const handleToggle = () => {
        if (isPlaying) {
            fadeOut();
        } else {
            fadeIn();
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    onClick={handleToggle}
                    aria-label={isPlaying ? 'Wyłącz dźwięk' : 'Włącz dźwięk'}
                    className="ambient-sound-btn"
                    style={{
                        position: 'fixed',
                        bottom: '40px',
                        right: '40px',
                        zIndex: 1000,
                        background: 'rgba(5, 8, 15, 0.5)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: `1px solid ${isPlaying ? COLORS.gradientEnd : 'rgba(255,255,255,0.15)'}`,
                        borderRadius: '30px',
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: isPlaying ? '#fff' : 'rgba(255,255,255,0.5)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        outline: 'none',
                        boxShadow: isPlaying ? `0 0 20px ${COLORS.gradientEnd}25` : 'none',
                        transition: 'border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease',
                    }}
                >
                    {/* Ikona — słupki animowane gdy gra, speaker off gdy nie */}
                    {isPlaying ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '14px' }}>
                            {[1, 2, 3, 4].map((bar) => (
                                <motion.div
                                    key={bar}
                                    animate={{ height: [4, 14, 6, 12] }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        repeatType: 'reverse',
                                        delay: bar * 0.1,
                                    }}
                                    style={{
                                        width: '2px',
                                        background: COLORS.gradientEnd,
                                        borderRadius: '1px',
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                    )}
                    <span>{isPlaying ? 'Sound On' : 'Sound Off'}</span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
