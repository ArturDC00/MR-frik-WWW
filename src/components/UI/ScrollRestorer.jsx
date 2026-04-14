'use client';
import { useEffect } from 'react';

// Usuwa klasy Lenis i GSAP które mogą blokować natywny scroll
// po nawigacji klienta ze strony głównej (gdzie Lenis jest aktywny)
export function ScrollRestorer() {
    useEffect(() => {
        const html = document.documentElement;
        html.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
        html.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('height');
    }, []);
    return null;
}
