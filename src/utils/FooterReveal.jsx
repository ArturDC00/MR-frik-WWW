import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * FooterReveal
 * ─────────────────────────────────────────────────────
 * Sekcja jest przyklejona do dołu (position: fixed; bottom: 0).
 * Spacer w normalnym flow ma wysokość równą sekcji.
 *
 * Gdy sekcja jest wyższa niż viewport, podczas scrollowania
 * przez spacer sekcja przesuwa się w górę (translateY),
 * odsłaniając górne partie – tak, jakby "wyjeżdżała" z dołu.
 *
 * FIXES:
 * - zIndex spacera: 0 → 11 (powyżej sekcji z zIndex:10, umożliwia scroll do footer)
 * - zIndex wrappera: -10 → 5 (był niewidoczny pod sekcjami; teraz widoczny nad tłem)
 * - Dodano synchroniczny pomiar przy mount (eliminuje race condition z Lenis)
 */
export function FooterReveal({ children }) {
    const wrapRef   = useRef(null);  // fixed wrapper
    const spacerRef = useRef(null);  // spacer w flow
    const [sectionH, setSectionH] = useState(0);
    const [measured, setMeasured] = useState(false);

    /* ── mierz wysokość sekcji — synchronicznie przy mount i przy resize ── */
    const measureHeight = useCallback(() => {
        if (!wrapRef.current) return;
        const h = wrapRef.current.getBoundingClientRect().height;
        if (h > 0) { setSectionH(h); setMeasured(true); }
    }, []);

    useEffect(() => {
        // Pierwsze pomiary synchronicznie po mount
        measureHeight();

        const ro = new ResizeObserver(() => measureHeight());
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [measureHeight]);

    /* ── scroll → translateY ── */
    const updateTranslate = useCallback(() => {
        if (!spacerRef.current || !wrapRef.current) return;

        const spacerTop = spacerRef.current.getBoundingClientRect().top;
        const vh = window.innerHeight;

        // FAZA WEJŚCIA: footer wjeżdża od dołu dopiero gdy spacer wchodzi do viewportu.
        // Clampujemy spacerTop do [0, vh] — footer jest ukryty dopóki spacer jest poniżej viewportu.
        // Bez tego klampowania footer pojawiał się nad sekcją FAQ gdy sectionH > vh.
        const clampedTop = Math.min(vh, Math.max(0, spacerTop));
        const entryOffset = sectionH * (clampedTop / vh);

        // FAZA PRZEWIJANIA: dla stopek wyższych niż viewport — odsłania górną część
        const overflow = Math.max(0, sectionH - vh);
        const scrollPhase = Math.min(overflow, Math.max(0, -spacerTop));

        const translateY = entryOffset - scrollPhase;
        wrapRef.current.style.transform = `translateY(${translateY}px)`;
    }, [sectionH]);

    useEffect(() => {
        // Lenis emituje 'app:scroll', natywny 'scroll' jako fallback
        window.addEventListener('app:scroll', updateTranslate, { passive: true });
        window.addEventListener('scroll',     updateTranslate, { passive: true });
        window.addEventListener('resize',     updateTranslate, { passive: true });
        updateTranslate(); // inicjalnie
        return () => {
            window.removeEventListener('app:scroll', updateTranslate);
            window.removeEventListener('scroll',     updateTranslate);
            window.removeEventListener('resize',     updateTranslate);
        };
    }, [updateTranslate]);

    return (
        <>
            {/* Spacer - zostaje w normalnym flow strony */}
            <div
                ref={spacerRef}
                style={{
                    position: 'relative',
                    // Spacer wypycha stronę, ale jako pusty div z pointerEvents: 'none' 
                    // nie zablokuje kliknięć, a zIndex 11 nie wpłynie na fixed footer
                    zIndex: 11, 
                    height: sectionH || 'auto',
                    minHeight: sectionH > 0 ? sectionH : undefined,
                    pointerEvents: 'none', 
                }}
            />

            {/* Fixed Footer - wyciągnięty ze spacera, tworzy własny niezależny kontekst */}
            <div
                ref={wrapRef}
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    // zIndex: 15 — ponad sekcjami (z: 10). Footer jest ukryty przez
                    // translateY(sectionH) gdy spacer poza viewport, wjeżdża od dołu gdy spacer wchodzi.
                    zIndex: 15,
                    willChange: 'transform',
                    visibility: measured ? 'visible' : 'hidden',
                }}
            >
                {children}
            </div>
        </>
    );
}