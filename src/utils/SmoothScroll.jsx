import React, { useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function SmoothScroll({ children }) {
    const lenisRef = useRef(null);

    useLayoutEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const lenis = new Lenis({
            // Wyłącz płynny scroll gdy użytkownik preferuje zredukowany ruch
            duration: prefersReducedMotion ? 0 : 1.5,
            easing: prefersReducedMotion ? (t) => t : (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: !prefersReducedMotion,
            wheelMultiplier: 1,
            touchMultiplier: 1,
            infinite: false,
        });

        lenisRef.current = lenis;
        // Ekspozycja na window żeby GlobeNavButtons mogło używać lenis.scrollTo(el)
        window.lenis = lenis;

        lenis.on('scroll', (e) => {
            ScrollTrigger.update();
            window.dispatchEvent(new CustomEvent('app:scroll', { detail: e.scroll }));
        });

        const update = (time) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        // Odśwież ScrollTrigger po załadowaniu sekcji lazy (~3s i ~6s)
        const t1 = setTimeout(() => { ScrollTrigger.refresh(); lenis.resize?.(); }, 3000);
        const t2 = setTimeout(() => { ScrollTrigger.refresh(); lenis.resize?.(); }, 6000);

        // iOS Safari — adres bar collapse/expand zmienia window.innerHeight → odśwież piny.
        // Debounce 400ms: visualViewport.resize odpala się przy każdym px scrolla na iOS,
        // bez debounce ScrollTrigger.refresh() na każdym frame = zabójstwo wydajności.
        const vv = window.visualViewport;
        let vvTimer = null;
        const onVVResize = () => {
            clearTimeout(vvTimer);
            vvTimer = setTimeout(() => {
                ScrollTrigger.refresh();
                lenis.resize?.();
            }, 400);
        };
        if (vv) vv.addEventListener('resize', onVVResize);

        return () => {
            gsap.ticker.remove(update);
            lenis.destroy();
            window.lenis = null;
            clearTimeout(t1);
            clearTimeout(t2);
            if (vv) vv.removeEventListener('resize', onVVResize);
            clearTimeout(vvTimer);
        };
    }, []);

    return (
        <div style={{ width: '100%', minHeight: '100vh' }}>
            {children}
        </div>
    );
}
