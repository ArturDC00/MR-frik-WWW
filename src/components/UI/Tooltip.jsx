import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants/colors';

export function Tooltip({ name, x, y }) {
    if (!name) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
                position: 'fixed',
                left: x + 25,
                top: y - 15,
                background: 'rgba(5, 8, 15, 0.95)',
                border: `2px solid ${COLORS.gradientEnd}`,
                padding: '12px 20px',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                pointerEvents: 'none',
                zIndex: 10050,
                backdropFilter: 'blur(20px)',
                boxShadow: `0 0 40px ${COLORS.gradientEnd}80, 0 8px 20px rgba(0,0,0,0.6)`,
                whiteSpace: 'nowrap',
                letterSpacing: '0.5px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                    className="pulsing-dot"
                    style={{
                        width: '8px',
                        height: '8px',
                        background: COLORS.gradientEnd,
                        borderRadius: '50%',
                        boxShadow: `0 0 10px ${COLORS.gradientEnd}`
                    }}
                />
                <span>{name}</span>
            </div>
        </motion.div>
    );
}