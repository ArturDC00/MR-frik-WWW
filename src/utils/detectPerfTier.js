/**
 * Jedna detekcja tieru wydajności dla całej aplikacji (App, WebGL, globus, kamera).
 * Musi być identyczna wszędzie — inaczej Bloom/DPR mówią „LOW”, a siatka kraju „MID”.
 *
 * Telefony: zwykle LOW (GPU + Lighthouse). Tablety Android bez „Mobile” w UA — MID,
 * żeby nie karać dużego ekranu tą samą geometrią co mały telefon.
 */
export function detectPerfTier() {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory ?? 4;
    const ua = navigator.userAgent;
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;

    const prefersReduced =
        typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const isIOSPhone = /iPhone|iPod/i.test(ua);
    const isIPadUA = /iPad/i.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
    const isAndroidPhone = /Android/i.test(ua) && /Mobile/i.test(ua);

    const isSmallScreen = w < 768;
    const isPhoneLike = isIOSPhone || isAndroidPhone || (isIPadUA && w < 768);

    if (prefersReduced || cores < 4 || memory < 4 || (isSmallScreen && isPhoneLike)) {
        return 'LOW';
    }
    if (cores >= 8 && memory >= 8) {
        return 'HIGH';
    }
    return 'MID';
}
