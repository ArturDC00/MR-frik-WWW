import React, { useEffect, useRef, useState } from 'react';
import { COLORS } from '../../constants/colors';

export function CustomCursor() {
    const [isTouchDevice] = useState(() =>
        typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    );

    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const mousePos = useRef({ x: 0, y: 0 });
    const dotPos = useRef({ x: 0, y: 0 });
    const ringPos = useRef({ x: 0, y: 0 });
    const magneticTarget = useRef(null);

    const magneticElementsCache = useRef([]);
    const lastCacheTime = useRef(0);

    useEffect(() => {
        if (isTouchDevice) return;
        const refreshCache = () => {
            magneticElementsCache.current = [...document.querySelectorAll('[data-magnetic]')];
            lastCacheTime.current = Date.now();
        };
        refreshCache();
        const observer = new MutationObserver(refreshCache);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [isTouchDevice]);

    useEffect(() => {
        if (isTouchDevice) return;
        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };

            const target = e.target;
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('port-marker') ||
                target.classList.contains('interactive');

            setIsHovering(!!isInteractive);

            // ✅ Używamy cache zamiast querySelectorAll przy każdym ruchu myszy
            let closestElement = null;
            let minDistance = 100;

            magneticElementsCache.current.forEach(el => {
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

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

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
        if (isTouchDevice) return;
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

    const accentColor = COLORS?.gradientEnd || '#4a90e2';

    const dotStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: isHovering ? '40px' : '8px',
        height: isHovering ? '40px' : '8px',
        background: isHovering ? 'rgba(253, 151, 49, 0.3)' : accentColor,
        border: isHovering ? `2px solid ${accentColor}` : 'none',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: 'width 0.3s ease, height 0.3s ease, background 0.3s ease'
    };

    const ringStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: isHovering ? '60px' : '40px',
        height: isHovering ? '60px' : '40px',
        border: isHovering ? `2px solid ${accentColor}` : '2px solid rgba(255,255,255,0.3)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: isVisible ? 1 : 0,
        transition: 'width 0.5s ease, height 0.5s ease, border-color 0.3s ease'
    };

    return (
        <>
            <div ref={dotRef} style={dotStyle} />
            <div ref={ringRef} style={ringStyle} />
        </>
    );
}