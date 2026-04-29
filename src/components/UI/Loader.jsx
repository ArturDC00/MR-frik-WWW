import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants/colors';

/**
 * Pełnoekranowy intro ładowania — nad hero (z-index), dopóki trwa animacja wyjścia.
 * Po zakończeniu (isLoaded) komponent znika z DOM — wtedy widać stronę / globus.
 */
export function Loader({ progress, onComplete, isLoaded }) {
    if (isLoaded) return null;

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={progress >= 100 ? { opacity: 0, pointerEvents: 'none' } : {}}
            transition={{ duration: 1.0 }}
            onAnimationComplete={onComplete}
            style={{
                position: 'fixed',
                inset: 0,
                background: '#000',
                zIndex: 10035,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'max(24px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
                pointerEvents: 'auto',
            }}
        >
            <div
                style={{
                    textAlign: 'center',
                    padding: '0 20px',
                    maxWidth: '100%',
                }}
            >
                <div
                    style={{
                        fontSize: 'clamp(13px, 2.8vw, 16px)',
                        color: COLORS.gradientEnd,
                        letterSpacing: '0.28em',
                        marginBottom: 'clamp(12px, 2vh, 20px)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                    }}
                >
                    Ładowanie
                </div>
                <div
                    style={{
                        fontSize: 'clamp(40px, 12vw, 96px)',
                        fontWeight: 800,
                        color: 'rgba(255,255,255,0.95)',
                        lineHeight: 1.05,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {Math.floor(progress)}
                    <span
                        style={{
                            fontSize: 'clamp(16px, 4vw, 28px)',
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.42)',
                            marginLeft: 'clamp(8px, 1.5vw, 14px)',
                            letterSpacing: '0.06em',
                        }}
                    >
                        KM/H
                    </span>
                </div>
                <div
                    style={{
                        width: '100%',
                        maxWidth: 'min(420px, 88vw)',
                        height: 'clamp(5px, 1.2vw, 8px)',
                        background: '#222',
                        margin: 'clamp(20px, 4vh, 32px) auto 0',
                        borderRadius: '4px',
                    }}
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{
                            height: '100%',
                            borderRadius: '4px',
                            background: `linear-gradient(90deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`,
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
