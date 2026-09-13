import React, { useEffect, useRef } from 'react';

export function FilmGrain({
    grainIntensity = 0.03,
    vignetteIntensity = 0.3,
    enableVignette = true,
    enableScanlines = false
}) {
    const grainRef = useRef(null);

    // Pauzuj animację CSS gdy zakładka jest w tle (oszczędność GPU)
    useEffect(() => {
        const handleVisibility = () => {
            if (!grainRef.current) return;
            grainRef.current.style.animationPlayState =
                document.hidden ? 'paused' : 'running';
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, []);

    // Dodaj animację do <head>
    useEffect(() => {
        const keyframesId = 'film-grain-keyframes';
        if (!document.getElementById(keyframesId)) {
            const styleEl = document.createElement('style');
            styleEl.id = keyframesId;
            styleEl.textContent = `
                @keyframes filmGrainMove {
                    0%, 100% { transform: translate(0, 0) }
                    10% { transform: translate(-5%, -10%) }
                    20% { transform: translate(-15%, 5%) }
                    30% { transform: translate(7%, -25%) }
                    40% { transform: translate(-5%, 25%) }
                    50% { transform: translate(-15%, 10%) }
                    60% { transform: translate(15%, 0%) }
                    70% { transform: translate(0%, 15%) }
                    80% { transform: translate(3%, 35%) }
                    90% { transform: translate(-10%, 10%) }
                }
            `;
            document.head.appendChild(styleEl);
        }
        // Cleanup nie usuwa stylów globalnych, żeby nie migało przy remountowaniu
    }, []);

    // Generuj teksturę szumu na Canvasie
    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;

        const imageData = ctx.createImageData(512, 512);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
            const c = Math.random() * 255;
            pixels[i] = c;     // R
            pixels[i + 1] = c; // G
            pixels[i + 2] = c; // B
            pixels[i + 3] = 255; // Alpha
        }
        ctx.putImageData(imageData, 0, 0);

        if (grainRef.current) {
            grainRef.current.style.backgroundImage = `url(${canvas.toDataURL()})`;
        }

        // Sprzątanie canvasu
        return () => {
            canvas.width = 0;
            canvas.height = 0;
        };
    }, []);

    return (
        <>
            {/* Warstwa Ziarna */}
            <div
                ref={grainRef}
                style={{
                    position: 'fixed',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    opacity: grainIntensity,
                    mixBlendMode: 'overlay',
                    backgroundRepeat: 'repeat',
                    animationName: 'filmGrainMove',
                    animationDuration: '8s',
                    animationTimingFunction: 'steps(10)',
                    animationIterationCount: 'infinite'
                }}
            />

            {/* Warstwa Winiety */}
            {enableVignette && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,${vignetteIntensity}) 100%)`
                }} />
            )}

            {/* Warstwa Scanlines */}
            {enableScanlines && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 9997,
                    opacity: 0.02,
                    background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
                }} />
            )}
        </>
    );
}

export function StarField({ particleCount = 200, speed = 0.5, paused = false }) {
    const canvasRef = useRef(null);
    // ✅ Wszystko w jednym ref — animate fn + id dostępne między effectami
    const animRef = useRef({ id: null, particles: null, ctx: null, animate: null });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        animRef.current.ctx = ctx;

        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setSize();

        animRef.current.particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            speedX: (Math.random() - 0.5) * speed,
            speedY: (Math.random() - 0.5) * speed,
            opacity: Math.random() * 0.5 + 0.2
        }));

        /**
         * Rysowanie zoptymalizowane bez zmiany wyglądu:
         *
         * 1) Jasności gwiazd (ciągłe 0.2–0.7) grupujemy w 8 poziomów i każdą grupę rysujemy JEDNĄ ścieżką.
         *    Wcześniej: 150 × (nowy string rgba + parsowanie koloru + beginPath/arc/fill) na klatkę.
         *    Teraz: 8 × fill. Błąd kwantyzacji ≤ 0.03 alfy na warstwie o opacity 0.4 — niewidoczny.
         * 2) 30 klatek/s z podwójnym krokiem, więc prędkość dryfu jest identyczna. Przy speed=0.2 gwiazda
         *    przesuwa się ≤ 0.14 px na klatkę 60 Hz — przy 30 Hz to ≤ 0.28 px, poniżej progu percepcji
         *    dla kropki < 2 px. Połowa pracy canvasa i połowa ponownych uploadów warstwy do kompozytora,
         *    dokładnie w czasie, gdy równolegle renderuje się globus WebGL.
         */
        const BUCKETS = 8;
        const MIN_OPACITY = 0.2;
        const OPACITY_RANGE = 0.5;
        const bucketStyles = Array.from({ length: BUCKETS }, (_, b) =>
            `rgba(255,255,255,${(MIN_OPACITY + ((b + 0.5) / BUCKETS) * OPACITY_RANGE).toFixed(4)})`
        );
        animRef.current.particles.forEach((p) => {
            p.bucket = Math.min(BUCKETS - 1, Math.floor(((p.opacity - MIN_OPACITY) / OPACITY_RANGE) * BUCKETS));
        });

        const FRAME_MS = 1000 / 30;
        const STEP_SCALE = 2;
        let lastDraw = 0;

        animRef.current.animate = (now) => {
            animRef.current.id = requestAnimationFrame(animRef.current.animate);
            if (now - lastDraw < FRAME_MS - 1) return;
            lastDraw = now;

            const { particles } = animRef.current;
            const w = canvas.width;
            const h = canvas.height;
            const paths = Array.from({ length: BUCKETS }, () => new Path2D());
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x = (p.x + p.speedX * STEP_SCALE + w) % w;
                p.y = (p.y + p.speedY * STEP_SCALE + h) % h;
                if (p.size <= 0) continue;
                const path = paths[p.bucket];
                path.moveTo(p.x + p.size, p.y);
                path.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            }
            ctx.clearRect(0, 0, w, h);
            for (let b = 0; b < BUCKETS; b++) {
                ctx.fillStyle = bucketStyles[b];
                ctx.fill(paths[b]);
            }
        };

        // Uruchom tylko jeśli nie jest zapauzowany
        if (!paused) {
            animRef.current.id = requestAnimationFrame(animRef.current.animate);
        }

        // Debounce: każdy resize realokuje bufor canvasa (~8 MB przy 1080p), a przeciąganie okna
        // odpala resize dziesiątki razy na sekundę.
        let resizeTimer = null;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setSize, 150);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animRef.current.id);
            animRef.current.id = null;
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
        };
    }, [particleCount, speed]); // eslint-disable-line react-hooks/exhaustive-deps

    // ✅ Pause/resume bez przebudowy całego effectu
    useEffect(() => {
        if (paused) {
            cancelAnimationFrame(animRef.current.id);
            animRef.current.id = null;
        } else if (animRef.current.animate && !animRef.current.id) {
            animRef.current.id = requestAnimationFrame(animRef.current.animate);
        }
    }, [paused]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
                opacity: paused ? 0 : 0.4,
                transition: 'opacity 0.5s ease'
            }}
        />
    );
}