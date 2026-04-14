import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function InteractiveLegend({ show }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!show) return null;

    const instructions = [
        { icon: '🖱️', text: 'Przeciągnij aby obrócić globus', key: 'rotate' },
        { icon: '🔍', text: 'Scroll aby przybliżyć/oddalić', key: 'zoom' },
        { icon: '🌍', text: 'Kliknij kraj aby zobaczyć szczegóły', key: 'country' },
        { icon: '⚓', text: 'Kliknij port aby sprawdzić połączenia', key: 'port' },
        { icon: '📍', text: 'Najechaj na kraj aby podświetlić', key: 'hover' },
    ];

    return (
        <div style={{
            position: 'fixed',
            left: '32px',  // ✅ LEWY DOLNY RÓG
            bottom: '32px',
            zIndex: 100,
        }}>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            bottom: '72px',
                            left: '0',  // ✅ Anchored to left
                            background: 'rgba(2, 2, 3, 0.95)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '20px',
                            minWidth: '320px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#FD9731',
                            marginBottom: '16px',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            Jak korzystać z globusa
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                        }}>
                            {instructions.map((item) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '8px 12px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(253, 151, 49, 0.1)';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                    <span style={{
                                        fontSize: '14px',
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        fontFamily: 'Inter, sans-serif',
                                        lineHeight: '1.4',
                                    }}>
                                        {item.text}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                aria-label={isExpanded ? 'Zamknij legendę' : 'Otwórz legendę'}
                aria-expanded={isExpanded}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FD9731 0%, #FDB863 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(253, 151, 49, 0.4)',
                    transition: 'all 0.3s ease',
                    fontSize: '24px',
                    position: 'relative',
                    zIndex: 101,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(253, 151, 49, 0.6)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(253, 151, 49, 0.4)';
                }}
            >
                <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isExpanded ? '✕' : '?'}
                </motion.span>
            </motion.button>

            {/* Pulsating indicator when closed */}
            {!isExpanded && (
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        border: '2px solid #FD9731',
                        zIndex: 100,
                        pointerEvents: 'none',
                    }}
                />
            )}
        </div>
    );
}