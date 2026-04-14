import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const valuesData = [
    {
        id: 1,
        title: "Dbamy o Twoje poczucie spokoju",
        description: "Od zakupu samochodu w USA lub Kanadzie aż po dostarczenie go pod Twój dom – zajmujemy się wszystkim, co potrzebne, aby Twoje auto bezpiecznie trafiło do Ciebie."
    },
    {
        id: 2,
        title: "Jesteśmy transparentni",
        description: "Od pierwszego kontaktu jasno przedstawiamy proces importu, koszty oraz możliwe scenariusze. Dzięki temu wiesz dokładnie, czego możesz się spodziewać."
    },
    {
        id: 3,
        title: "Łączymy doświadczenie z zaangażowaniem",
        description: "Import samochodów z Ameryki to nasza codzienność. Podchodzimy indywidualnie do każdego klienta i każdego auta. Nie tylko znamy się na swojej pracy – naprawdę ją lubimy!"
    }
];

const images = [
    "/Photo/Glowna/AdobeStock_1108144587.webp",  // czerwone Porsche w garażu
    "/Photo/Glowna/AdobeStock_1694899024.webp",  // koło w deszczu
    "/Photo/Glowna/AdobeStock_1067220131.webp",  // czerwone sportowe auto tył
    "/Photo/Glowna/AdobeStock_1578083583.webp",  // ZDJĘCIE GŁÓWNE BOHATERA
    "/Photo/Glowna/AdobeStock_1839391965.webp",  // pomarańczowe EV ładowanie
    "/Photo/Glowna/AdobeStock_1279201599.webp",  // tan 4Runner w górach
    "/Photo/Glowna/AdobeStock_1764238262.webp",  // SUV zachód słońca
];

export function ValuesSection() {
    const sectionRef = useRef(null);
    const mainTitleRef = useRef(null);
    const gridMasterRef = useRef(null);
    const glassCardRef = useRef(null);

    const [activeCard, setActiveCard] = useState(0);

    useEffect(() => {
        // Scroll distance skalowane do urządzenia:
        // - phone (< 768px): ~2× viewport height — wystarczy na płynną animację 3 kart
        // - tablet/desktop (≥ 768px): oryginalna wartość desktopowa
        // Bez tego na mobile użytkownik musi scrollować 5+ ekranów przez tę jedną sekcję,
        // co uniemożliwia dotarcie do dalszych sekcji (FAQ).
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const scrollEnd = window.innerWidth < 768
            ? `+=${Math.round(window.innerHeight * 2)}`
            : '+=4500';

        let ctx = gsap.context(() => {
            const sideItems = gsap.utils.toArray('.side-item');

            // Gdy prefers-reduced-motion: pokaż od razu bez animacji skalowania
            gsap.set(gridMasterRef.current, {
                scale: prefersReducedMotion ? 1 : 4,
                transformOrigin: "center center"
            });
            gsap.set(sideItems, { opacity: prefersReducedMotion ? 1 : 0 });
            gsap.set(glassCardRef.current, { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 50 });
            gsap.set(mainTitleRef.current, { opacity: prefersReducedMotion ? 1 : 0, y: 0, immediateRender: true });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: prefersReducedMotion ? `+=${window.innerHeight}` : scrollEnd,
                    pin: true,
                    scrub: prefersReducedMotion ? true : 0.8,
                    anticipatePin: 1,
                    fastScrollEnd: true,
                }
            });

            tl.to(mainTitleRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
            }, 0)
                .to(mainTitleRef.current, {
                opacity: 0,
                y: -40,
                duration: 0.8,
                ease: "power2.inOut",
            }, 0.5)
                .to(gridMasterRef.current, { scale: 1, duration: 2.5, ease: "power2.inOut" }, 0)
                .to(sideItems, { opacity: 1, duration: 1.5, ease: "power2.inOut" }, 0.5);

            tl.to(glassCardRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.5);

            tl.to({}, {
                duration: 4,
                onUpdate: function () {
                    const progress = this.progress();
                    if (progress < 0.33) setActiveCard(0);
                    else if (progress < 0.66) setActiveCard(1);
                    else setActiveCard(2);
                }
            }, 2.7);

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="values-section-wrapper">

            {/* LOKALNY BLOK CSS: Pełne RWD */}
            <style>{`
                .values-section-wrapper {
                    position: relative; 
                    height: 100vh; 
                    width: 100vw; 
                    background: #050505; 
                    overflow: hidden; 
                    z-index: 1;
                }
                
                /* MASTER KONTENER SIATKI — CSS Grid gwarantuje równe wiersze */
                .rwd-grid-master {
                    width: 100%; 
                    height: 100%; 
                    padding: 0; 
                    box-sizing: border-box; 
                    display: grid;
                    grid-template-rows: 1fr 2.5fr 1fr;
                    gap: 8px;
                    max-width: 100vw;
                }
                
                /* WSPÓLNE KLOCKI */
                .rwd-img-wrap { 
                    position: relative; 
                    width: 100%; 
                    height: 100%; 
                    border-radius: 8px; 
                    overflow: hidden;
                    min-height: 0;
                }
                
                .rwd-img-base { 
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover; 
                }
                
                .rwd-ov-side { 
                    position: absolute; 
                    inset: 0; 
                    background: rgba(0,0,0,0.5); 
                    pointer-events: none; 
                }
                
                .rwd-ov-center { 
                    position: absolute; 
                    inset: 0; 
                    background: rgba(0,0,0,0.2); 
                    pointer-events: none; 
                }
                
                /* WIERSZE — tylko flexbox dla kolumn, wysokość z CSS Grid */
                .rwd-row-top, .rwd-row-bot, .rwd-row-mid { 
                    display: flex; 
                    gap: 8px;
                    min-height: 0;
                }
                
                .rwd-col-side { 
                    flex: 1;
                    min-width: 0;
                }
                
                .rwd-col-center { 
                    flex: 2;
                    min-width: 0;
                }
                
                .rwd-glass-card {
    position: absolute; 
    top: 50%; 
    left: 50%; 
    transform: translate(-50%, -50%);
    width: calc(100% - 32px);
    max-width: 90%;
    min-height: 280px; 
    padding: 32px 20px;
    border-radius: 24px;
    border: 1px solid transparent;                /* ← ZMIEŃ */
    background: rgba(255, 255, 255, 0.10);
    background-clip: padding-box;                 /* ← DODAJ */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 30; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    text-align: center;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 0 0 1px transparent;             /* ← DODAJ */
}

.rwd-glass-card::before {                        /* ← DODAJ CAŁY PSEUDO-ELEMENT */
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(90deg, #F7F7F7 0%, rgba(255, 255, 255, 0) 100%);
    -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
}

                /* SMALL TABLETS (600px - 767px) */
                @media (min-width: 600px) {
                    .rwd-grid-master { 
                        gap: 10px; 
                    }
                    
                    .rwd-row-top, .rwd-row-bot, .rwd-row-mid { 
                        gap: 10px;
                    }
                    
                    .rwd-img-wrap { 
                        border-radius: 10px; 
                    }
                    
                    .rwd-glass-card { 
                        padding: 40px 32px;
                        max-width: 85%;
                    }
                }

                /* TABLETS (768px - 1023px) */
                @media (min-width: 768px) {
                    .rwd-grid-master { 
                        gap: 12px;
                        padding: 0 20px;
                    }
                    
                    .rwd-row-top, .rwd-row-bot, .rwd-row-mid { 
                        gap: 12px;
                    }
                    
                    .rwd-img-wrap { 
                        border-radius: 12px; 
                    }
                    
                    .rwd-glass-card { 
                        width: 700px;
                        max-width: 85%;
                        min-height: 320px; 
                        padding: 48px 40px;
                        border-radius: 24px;
                    }
                }

                /* DESKTOP SMALL (1024px - 1279px) */
                @media (min-width: 1024px) {
                    .rwd-grid-master { 
                        gap: 14px;
                        padding: 0 40px;
                        max-width: 1400px;
                        margin: 0 auto;
                    }
                    
                    .rwd-row-top, .rwd-row-bot, .rwd-row-mid { 
                        gap: 14px;
                    }
                    
                    .rwd-glass-card { 
                        width: 800px;
                        max-width: 80%;
                        min-height: 360px;
                    }
                }

                /* DESKTOP MEDIUM (1280px - 1535px) */
                @media (min-width: 1280px) {
                    .rwd-grid-master { 
                        gap: 16px;
                        padding: 0 60px;
                        max-width: 1600px;
                    }
                    
                    .rwd-row-top, .rwd-row-bot, .rwd-row-mid { 
                        gap: 16px;
                    }
                    
                    .rwd-glass-card { 
                        width: 878px;
                        max-width: 878px;
                        min-height: 380px;
                        padding: 60px 80px;
                    }
                }

                /* DESKTOP LARGE (1536px - 1727px) */
                @media (min-width: 1536px) {
                    .rwd-grid-master { 
                        gap: 18px;
                        padding: 0 80px;
                        max-width: 1700px;
                    }
                }

                /* ULTRA WIDE (1728px+) */
                @media (min-width: 1728px) {
                    .rwd-grid-master { 
                        max-width: 1728px;
                        gap: 20px;
                        padding: 0 100px;
                    }
                }

                /* SUPER ULTRA WIDE (2000px+) */
                @media (min-width: 2000px) {
                    .rwd-grid-master { 
                        max-width: 1920px;
                    }
                }
            `}</style>

            {/* GŁÓWNY NAGŁÓWEK NA STARCIE */}
            <div ref={mainTitleRef} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                width: '100%',
                textAlign: 'center',
                pointerEvents: 'none',
                padding: '0 20px'
            }}>
                <h2 style={{
                    fontFamily: '"Monument Extended", sans-serif',
                    fontSize: 'clamp(28px, 4.5vw, 82px)',
                    fontWeight: '400',
                    color: '#fff',
                    textShadow: '0 4px 30px rgba(0,0,0,0.8)',
                    margin: 0,
                    lineHeight: '1.2',
                    letterSpacing: '0.02em'
                }}>
                    Wartości, które nas napędzają
                </h2>
            </div>

            {/* SIATKA */}
            <div style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden'
            }}>
                <div ref={gridMasterRef} className="rwd-grid-master" style={{ height: '100%' }}>

                    {/* WIERSZ 1 (Góra) */}
                    <div className="rwd-row-top">
                        <div className="side-item rwd-img-wrap rwd-col-side">
                            <Image src={images[0]} className="rwd-img-base" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                            <div className="rwd-ov-side" />
                        </div>
                        <div className="side-item rwd-img-wrap rwd-col-side">
                            <Image src={images[1]} className="rwd-img-base" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                            <div className="rwd-ov-side" />
                        </div>
                    </div>

                    {/* WIERSZ 2 (Środek ze Zdjęciem Bohatera) */}
                    <div className="rwd-row-mid">
                        <div className="side-item rwd-img-wrap rwd-col-side">
                            <Image src={images[2]} className="rwd-img-base" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                            <div className="rwd-ov-side" />
                        </div>

                        <div className="rwd-img-wrap rwd-col-center">
                            <Image src={images[3]} className="rwd-img-base" alt="Główne zdjęcie — import samochodów MrFrik" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                            <div className="rwd-ov-center" />
                        </div>

                        <div className="side-item rwd-img-wrap rwd-col-side">
                            <Image src={images[4]} className="rwd-img-base" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                            <div className="rwd-ov-side" />
                        </div>
                    </div>

                    {/* WIERSZ 3 (Dół) */}
                    <div className="rwd-row-bot">
                        <div className="side-item rwd-img-wrap rwd-col-side">
                            <Image src={images[5]} className="rwd-img-base" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover', objectPosition: 'center 55%' }} />
                            <div className="rwd-ov-side" />
                        </div>
                        <div className="side-item rwd-img-wrap rwd-col-side">
                            <Image src={images[6]} className="rwd-img-base" alt="" fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover', objectPosition: 'center 50%' }} />
                            <div className="rwd-ov-side" />
                        </div>
                    </div>

                </div>
            </div>

            {/* TAFLA SZKŁA */}
            <div ref={glassCardRef} className="rwd-glass-card">
                <div style={{ position: 'relative', width: '100%', minHeight: '140px' }}>
                    {valuesData.map((value, index) => (
                        <div key={value.id} style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '100%',
                            opacity: activeCard === index ? 1 : 0,
                            transform: `translate(-50%, -50%) translateY(${activeCard === index ? '0px' : '20px'})`,
                            transition: 'all 0.6s ease-in-out',
                            pointerEvents: activeCard === index ? 'auto' : 'none'
                        }}>
                            <h3 style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 'clamp(22px, 2.8vw, 39px)',
                                fontWeight: '700',
                                color: 'white',
                                margin: '0 0 16px 0',
                                lineHeight: '1.3'
                            }}>
                                {value.title}
                            </h3>
                            <p style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 'clamp(15px, 1.4vw, 20px)',
                                lineHeight: '1.6',
                                color: 'rgba(245, 245, 245, 0.9)',
                                margin: '0 auto',
                                maxWidth: '600px',
                                padding: '0 10px'
                            }}>
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '4px', marginTop: '32px' }}>
                    {[0, 1, 2].map((index) => (
                        <button
                            key={index}
                            onClick={() => setActiveCard(index)}
                            aria-label={`Wartość ${index + 1}`}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '12px 10px',
                                minWidth: '44px',
                                minHeight: '44px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <div style={{
                                width: activeCard === index ? '40px' : '10px',
                                height: '6px',
                                borderRadius: '3px',
                                background: activeCard === index ? 'linear-gradient(90deg, #FD9731 0%, #FF6B35 100%)' : 'rgba(255, 255, 255, 0.3)',
                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            }} />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}