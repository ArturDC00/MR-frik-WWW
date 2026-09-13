import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../../constants/colors';

/**
 * Tooltip kraju pod kursorem.
 *
 * Pozycję trzyma i aktualizuje SAM, bezpośrednio na elemencie — nie przez propsy.
 * Wcześniej App zapisywał pozycję myszy do stanu przy każdym pointermove nad krajem, więc każdy
 * ruch myszy przerenderowywał całe App, 7 sekcji i scenę 3D tylko po to, żeby przesunąć ten
 * dymek o kilka pikseli. Teraz App renderuje go tylko przy zmianie kraju.
 *
 * Zewnętrzny div przesuwa się po ekranie (`transform`), wewnętrzny motion.div robi wejście
 * (opacity / scale / y) — rozdzielone, żeby framer-motion i pozycja nie nadpisywały sobie
 * nawzajem `transform`. Offset +25 / -15 jak wcześniej (`left: x + 25`, `top: y - 15`).
 */
export function Tooltip({ name, initialPosRef }) {
    const boxRef = useRef(null);

    useLayoutEffect(() => {
        const box = boxRef.current;
        if (!box) return undefined;

        const place = (x, y) => {
            box.style.transform = `translate3d(${x + 25}px, ${y - 15}px, 0)`;
        };
        const start = initialPosRef?.current;
        if (start) place(start.x, start.y);

        const onMove = (e) => place(e.clientX, e.clientY);
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, [initialPosRef]);

    if (!name) return null;

    return (
        <div
            ref={boxRef}
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                pointerEvents: 'none',
                zIndex: 10050,
                willChange: 'transform',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                    background: 'rgba(5, 8, 15, 0.95)',
                    border: `2px solid ${COLORS.gradientEnd}`,
                    padding: '12px 20px',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '700',
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
        </div>
    );
}
