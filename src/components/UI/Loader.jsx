import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants/colors';

export function Loader({ progress, onComplete }) {
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
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: '12px',
                    color: COLORS.gradientEnd,
                    letterSpacing: '3px',
                    marginBottom: '8px',
                    fontWeight: 600
                }}>
                    ŁADOWANIE
                </div>
                <div style={{
                    fontSize: '72px',
                    fontWeight: '800',
                    color: '#fff',
                    lineHeight: 1
                }}>
                    {Math.floor(progress)}
                    <span style={{ fontSize: '20px', color: '#999' }}> KM/H</span>
                </div>
                <div style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '4px',
                    background: '#222',
                    margin: '20px auto',
                    borderRadius: '2px'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        style={{
                            height: '100%',
                            background: `linear-gradient(90deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})`
                        }}
                    />
                </div>
            </div>
        </motion.div>
    );
}