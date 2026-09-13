import React, { useEffect, useRef } from 'react';

/**
 * Lenis + GSAP ScrollTrigger.
 *
 * lenis / gsap / ScrollTrigger są importowane DYNAMICZNIE wewnątrz efektu (a nie statycznie na
 * poziomie modułu), bo App importuje ten plik eagerly — statyczne importy trzymały gsap-core,
 * CSSPlugin, ScrollTrigger i lenis (~127 KiB raw / ~45 KB gz) w grupie chunków, która musi się
 * pobrać i sparsować przed pierwszym pikselem treści. Wygładzanie scrolla nie jest potrzebne
 * w pierwszej klatce — jest potrzebne od pierwszego gestu użytkownika.
 */
export function SmoothScroll({ children }) {
    const lenisRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        let teardown = null;

        (async () => {
            let Lenis;
            let gsap;
            let ScrollTrigger;
            try {
                const [lenisMod, gsapMod, stMod] = await Promise.all([
                    import('lenis'),
                    import('gsap'),
                    import('gsap/ScrollTrigger'),
                ]);
                Lenis = lenisMod.default;
                gsap = gsapMod.default;
                ScrollTrigger = stMod.ScrollTrigger;
            } catch (e) {
                // Chunk się nie pobrał — klasyczny przypadek to stara karta z nieaktualnymi
                // hashami po redeployu, offline albo flaky sieć. Strona musi zostać w pełni
                // użyteczna: natywny scroll działa dalej, tracimy tylko wygładzanie.
                console.warn('[SmoothScroll] nie udało się załadować lenis/gsap — scroll bez wygładzania', e);
                return;
            }
            if (cancelled) return;

            gsap.registerPlugin(ScrollTrigger);

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

            // Odśwież ScrollTrigger po załadowaniu sekcji lazy (~3s i ~6s).
            // NIE przepinać tego na zdarzenie „sekcje zamontowane”: GSAP sam kolejkuje
            // _refreshAll po inicjalizacji przypiętego triggera (ScrollTrigger.js:1952), a na
            // mobile refresh z 6 s jest jedynym, który łapie zmiany wysokości od obrazów
            // i fontów domykających się po commicie Reacta.
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

            teardown = () => {
                gsap.ticker.remove(update);
                lenis.destroy();
                lenisRef.current = null;
                window.lenis = null;
                clearTimeout(t1);
                clearTimeout(t2);
                if (vv) vv.removeEventListener('resize', onVVResize);
                clearTimeout(vvTimer);
            };
        })();

        return () => {
            cancelled = true;
            if (teardown) teardown();
        };
    }, []);

    return (
        <div style={{ width: '100%', minHeight: '100%', position: 'relative' }}>
            {children}
        </div>
    );
}
