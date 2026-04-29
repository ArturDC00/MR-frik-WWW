'use client';

import Image from 'next/image';

/**
 * Lekki, statyczny placeholder podczas ładowania chunka WebGL (next/dynamic).
 * Bez Framer Motion — mniejszy koszt pierwszego paintu; wizualnie zbliżony do HeroContent.
 */
export function StaticHeroPlaceholder() {
    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                background: '#020203',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}
            aria-hidden
        >
            <div
                style={{
                    position: 'absolute',
                    top: 'clamp(16px, 3vw, 24px)',
                    left: 'clamp(16px, 4vw, 32px)',
                }}
            >
                <Image
                    src="/models/MrFrik_reBranding_logo_2025-13.png"
                    alt=""
                    width={240}
                    height={170}
                    style={{ objectFit: 'contain', objectPosition: 'left center', maxWidth: 'min(240px, 55vw)' }}
                    priority
                />
            </div>

            <h1
                style={{
                    fontFamily: 'Monument Extended, Inter, sans-serif',
                    fontSize: 'clamp(32px, 8vw, 82px)',
                    lineHeight: 1.2,
                    fontWeight: 800,
                    margin: 0,
                    padding: '0 20px',
                    maxWidth: '90%',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255,255,255,0.8) 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                Import aut z USA i Kanady
            </h1>
            <p
                style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(16px, 4vw, 24px)',
                    lineHeight: 1.6,
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.85)',
                    margin: '24px 0 0',
                    padding: '0 20px',
                    maxWidth: '600px',
                    textAlign: 'center',
                }}
            >
                Oszczędź nawet 40% w porównaniu do cen europejskich
            </p>
        </div>
    );
}
