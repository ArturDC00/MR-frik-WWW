import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from '../../constants/colors';

const ACCENT = COLORS?.gradientEnd || '#4a90e2';

/**
 * Stany kursora jako klasy CSS zamiast stanu Reacta — wartości i przejścia 1:1 jak w dawnych
 * stylach inline. Zmiana „najechany / nie” przełącza klasę bezpośrednio na elemencie, więc
 * komponent po zamontowaniu w ogóle się nie przerenderowuje.
 *
 * `border` kropki nie jest w transition (jak wcześniej) — przełącza się natychmiast;
 * `opacity` też nie była animowana.
 */
const CURSOR_CSS = `
.cc-dot, .cc-ring { position: fixed; top: 0; left: 0; border-radius: 50%; pointer-events: none; }
.cc-dot {
    width: 8px; height: 8px; background: ${ACCENT}; border: none; z-index: 10070;
    transition: width 0.3s ease, height 0.3s ease, background 0.3s ease;
}
.cc-dot.cc-hot { width: 40px; height: 40px; background: rgba(253, 151, 49, 0.3); border: 2px solid ${ACCENT}; }
.cc-ring {
    width: 40px; height: 40px; border: 2px solid rgba(255,255,255,0.3); z-index: 10069;
    transition: width 0.5s ease, height 0.5s ease, border-color 0.3s ease;
}
.cc-ring.cc-hot { width: 60px; height: 60px; border: 2px solid ${ACCENT}; }
.cc-dot.cc-hidden, .cc-ring.cc-hidden { opacity: 0; }
`;

export function CustomCursor() {
    const [isTouchDevice] = useState(() =>
        typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );

    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const hotRef = useRef(false);

    const mousePos = useRef({ x: 0, y: 0 });
    const dotPos = useRef({ x: 0, y: 0 });
    const ringPos = useRef({ x: 0, y: 0 });
    const magneticTarget = useRef(null);

    const magneticElementsCache = useRef([]);

    useEffect(() => {
        if (isTouchDevice) return undefined;
        const refreshCache = () => {
            magneticElementsCache.current = [...document.querySelectorAll('[data-magnetic]')];
        };
        refreshCache();
        // Debounce zamiast odświeżania przy KAŻDEJ partii mutacji DOM: wcześniej obserwator na całym
        // dokumencie robił querySelectorAll po całej stronie przy montowaniu sekcji, każdym wejściu
        // i wyjściu AnimatePresence i wstrzyknięciu widżetu Bitrix. Funkcja „magnetic” zostaje.
        let timer = null;
        const observer = new MutationObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(refreshCache, 250);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [isTouchDevice]);

    useEffect(() => {
        if (isTouchDevice) return undefined;

        const setClass = (name, on) => {
            dotRef.current?.classList.toggle(name, on);
            ringRef.current?.classList.toggle(name, on);
        };

        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };

            const target = e.target;
            // Ten sam warunek co wcześniej, ale jedno przejście w górę drzewa zamiast dwóch
            // (`closest` obejmuje sam element, więc zastępuje też sprawdzenie tagName).
            const hot = target instanceof Element && (
                !!target.closest('button, a') ||
                target.classList.contains('port-marker') ||
                target.classList.contains('interactive')
            );
            if (hot !== hotRef.current) {
                hotRef.current = hot;
                setClass('cc-hot', hot);
            }

            const magnets = magneticElementsCache.current;
            if (magnets.length === 0) {
                magneticTarget.current = null;
                return;
            }

            let closestElement = null;
            let minDistance = 100;
            magnets.forEach(el => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestElement = { x: centerX, y: centerY, strength: 1 - (distance / 100) };
                }
            });

            magneticTarget.current = closestElement;
        };

        const handleMouseEnter = () => setClass('cc-hidden', false);
        const handleMouseLeave = () => setClass('cc-hidden', true);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isTouchDevice]);

    useEffect(() => {
        if (isTouchDevice) return undefined;
        let animationFrameId;

        const animate = () => {
            let targetX = mousePos.current.x;
            let targetY = mousePos.current.y;

            if (magneticTarget.current) {
                const { x, y, strength } = magneticTarget.current;
                targetX = mousePos.current.x + (x - mousePos.current.x) * strength * 0.5;
                targetY = mousePos.current.y + (y - mousePos.current.y) * strength * 0.5;
            }

            dotPos.current.x += (targetX - dotPos.current.x) * 0.3;
            dotPos.current.y += (targetY - dotPos.current.y) * 0.3;

            ringPos.current.x += (targetX - ringPos.current.x) * 0.15;
            ringPos.current.y += (targetY - ringPos.current.y) * 0.15;

            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`;
            }
            if (ringRef.current) {
                ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isTouchDevice]);

    if (isTouchDevice) return null;

    return (
        <>
            <style>{CURSOR_CSS}</style>
            <div ref={dotRef} className="cc-dot" />
            <div ref={ringRef} className="cc-ring" />
        </>
    );
}
