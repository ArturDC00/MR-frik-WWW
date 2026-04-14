import React, { useEffect, useRef, useState } from 'react'; // useRef needed for carContainerRef + section
import Image from 'next/image';

// Canvas 3D usunięty — powodował 3. instancję WebGL jednocześnie z Globusem i Porsche.
// Trzy Canvas = WebGL context loss = czarny ekran na Mac/mobile.
// Zastąpiony obrazem auta z delikatnym efektem parallax (CSS transform via scroll).

// --- STYLE CSS (Wstrzyknięte dla RWD) ---
const styles = `
  .trust-section {
    position: relative;
    min-height: auto;
    background: #000;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    z-index: 4;
    overflow: hidden;
  }

  .main-container {
    width: 100%;
    max-width: 1728px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 60px;
    position: relative;
  }

  /* Sekcja Statystyk */
  .stats-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(40px, 6vw, 80px);
    width: 100%;
  }

  .stats-box {
    width: 100%;
    max-width: 1360px;
    min-height: 370px;
    border-radius: 24px;
    border: 1px solid rgba(247, 247, 247, 0.1);
    background: radial-gradient(77.98% 77.98% at 50% 50.04%, rgba(16, 32, 68, 0.50) 0%, rgba(8, 16, 34, 0.50) 50%, rgba(4, 8, 17, 0.50) 75%, rgba(0, 0, 0, 0.50) 100%);
    backdrop-filter: blur(27.2px);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 80px;
    padding: 60px 20px;
    transition: all 1.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 348px;
    text-align: center;
  }

  .stat-divider {
    width: 1px;
    height: 92px;
    background: rgba(253, 151, 49, 0.3);
    flex-shrink: 0;
  }

  /* Typografia RWD */
  .stat-label {
    font-size: clamp(20px, 2vw, 31px);
    line-height: 1.5;
  }
  
  .stat-number {
    font-size: clamp(40px, 5vw, 70px);
    line-height: 1;
  }

  .stat-desc {
    font-size: clamp(14px, 1.5vw, 20px);
  }

  .main-title {
    font-size: clamp(28px, 4.5vw, 72px);
    line-height: 1.2;
    text-align: center;
    padding: 0 10px;
    /* Inter zamiast Monument Extended dla nagłówków sekcji — spójność z brandingiem */
  }

  /* Scena z Samochodem i Opiniami */
  .car-stage {
    width: 100%;
    max-width: 1512px;
    position: relative;
    min-height: 600px;
    display: flex;
    justify-content: space-between;
    gap: 0;
    padding-bottom: 520px;
  }

  .opinions-column {
    display: flex;
    flex-direction: column;
    gap: 48px;
    width: 100%;
    max-width: 556px;
    z-index: 2;
  }

  .opinion-card {
    position: relative;
    width: 100%;
    display: flex;
    gap: 20px;
  }
  
  .opinion-card-left {
    align-items: flex-start;
    text-align: right;
    justify-content: flex-end;
  }

  .opinion-card-right {
    align-items: flex-start;
    text-align: left;
    justify-content: flex-start;
  }

  .opinion-text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .opinion-name {
    font-size: clamp(18px, 1.5vw, 25px);
  }

  .opinion-desc {
    font-size: clamp(14px, 1.2vw, 20px);
    line-height: 1.6;
  }

  .animated-line-container {
    display: block;
    z-index: 1;
  }

  /* Auto — desktop: absolute na dole sekcji, nad liniami */
  .car-image-container {
    position: absolute;
    left: 50%;
    bottom: -190px;
    transform: translateX(-50%);
    width: 720px;
    height: 900px;
    z-index: 3;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .car-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 10px 40px rgba(253, 151, 49, 0.25))
            drop-shadow(0 0 80px rgba(253, 151, 49, 0.1));
  }

  /* --- MEDIA QUERIES --- */

  /* Tablet landscape */
  @media (max-width: 1280px) {
    .car-stage {
      padding-bottom: 360px;
    }
    .car-image-container {
      width: 560px;
      height: 310px;
      bottom: -140px;
    }
    .animated-line-container {
      display: none;
    }
  }

  /* Tablet portrait */
  @media (max-width: 1024px) {
    .car-stage {
      padding-bottom: 300px;
    }
    .car-image-container {
      width: 480px;
      height: 265px;
      bottom: -100px;
    }
  }

  /* Mobile */
  @media (max-width: 900px) {
    .trust-section {
        padding: 60px 20px;
    }

    .main-container { gap: 60px; }

    .stats-box {
      flex-direction: column;
      gap: 40px;
      padding: 40px 20px;
      min-height: auto;
    }

    .stat-divider {
      width: 100px;
      height: 1px;
    }

    .car-stage {
      flex-direction: column;
      align-items: center;
      gap: 40px;
      min-height: auto;
      padding-bottom: 0;
    }

    .opinions-column {
      gap: 40px;
      align-items: center;
    }

    .opinion-card {
      text-align: center !important;
      justify-content: center !important;
      flex-direction: column;
      align-items: center !important;
    }
    
    .opinion-card-left, .opinion-card-right {
        text-align: center;
    }

    .opinion-dot {
        display: none; 
    }

    /* Mobile: auto jako normalny element w flow, nie absolute */
    .car-image-container {
      position: relative;
      left: auto;
      bottom: auto;
      transform: none;
      width: min(340px, 90vw);
      height: auto;
      aspect-ratio: 16 / 9;
      margin: 0 auto;
      order: 3;
    }
  }

  @media (max-width: 480px) {
    .car-image-container {
      width: min(300px, 92vw);
    }
  }
`;

// Hook do animacji licznika
// ✅ Poprawiony cleanup RAF — poprzednia wersja nie anulowała rekurencyjnych frameów
function useCounter(end, duration = 2500, shouldStart = false) {
    const [count, setCount] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!shouldStart) return;

        let startTime;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easedProgress * end));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end);
                rafRef.current = null;
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [end, duration, shouldStart]);

    return count;
}

// Animated Line — pure CSS, no JS animation loop, always fully visible
// Background track + travelling spark via CSS keyframes (60fps GPU-composited)
function AnimatedLine({ pathData, gradientId, position, isLeft, hasAnimated }) {
    const sparkId = `spark-${gradientId}`;

    return (
        <div className="animated-line-container" style={{
            position: 'absolute',
            [isLeft ? 'left' : 'right']: isLeft ? '586px' : '580px',
            ...position,
            pointerEvents: 'none',
            opacity: hasAnimated ? 1 : 0,
            transition: 'opacity 1.2s ease 0.6s'
        }}>

            <svg style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }} {...pathData.svgProps}>
                <defs>
                    <style>{`
                        @keyframes spark-travel-${gradientId} {
                            from { stroke-dashoffset: 0; }
                            to   { stroke-dashoffset: -1100; }
                        }
                        @media (prefers-reduced-motion: reduce) {
                            .animated-spark-${gradientId} {
                                animation: none !important;
                            }
                        }
                    `}</style>
                </defs>
                {/* Always-visible dim track */}
                <path
                    d={pathData.path}
                    stroke="rgba(253, 151, 49, 0.25)"
                    strokeWidth="2"
                    fill="none"
                    style={{
                        strokeDasharray: 1100,
                        strokeDashoffset: hasAnimated ? 0 : 1100,
                        transition: 'stroke-dashoffset 1.5s cubic-bezier(0.65, 0, 0.35, 1) 0.8s'
                    }}
                />
                {/* Travelling spark — bright dash moving along the path */}
                {hasAnimated && (
                    <path
                        d={pathData.path}
                        stroke="#FD9731"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        filter={`drop-shadow(0 0 4px #FD9731)`}
                        className={`animated-spark-${gradientId}`}
                        style={{
                            strokeDasharray: '80 1020',
                            strokeDashoffset: 0,
                            animation: `spark-travel-${gradientId} 3s linear infinite`,
                        }}
                    />
                )}
            </svg>
        </div>
    );
}

const TRUST_CARDS = [
    {
        title: 'Import z USA i Kanady od A do Z',
        text: 'Nasze doświadczenie w imporcie samochodów z Ameryki pozwala bezpiecznie przejść przez cały proces – z pełnym wsparciem i jasną komunikacją na każdym etapie.',
    },
    {
        title: 'Większy wybór samochodów',
        text: 'Amerykański rynek samochodowy oferuje ogromną liczbę pojazdów – od popularnych modeli po rzadkie konfiguracje i bogate wersje wyposażenia.',
    },
    {
        title: 'Atrakcyjne ceny',
        text: 'Dzięki zakupom na aukcjach samochodowych w USA i Kanadzie często można zaoszczędzić nawet do 40% w porównaniu do cen w Europie.',
    },
    {
        title: 'Pełna kontrola nad procesem',
        text: 'Jako nasz klient, otrzymujesz dostęp do naszej platformy importu, gdzie w jednym miejscu możesz śledzić postęp importu auta. Znajdziesz tam status transportu, dokumenty, umowy oraz kalkulator kosztów.',
    },
];

// Opinion Card - Left
function OpinionCardLeft({ delay = 0, hasAnimated, cardIndex }) {
    const card = TRUST_CARDS[cardIndex] || TRUST_CARDS[0];
    return (
        <div className="opinion-card opinion-card-left" style={{
            opacity: hasAnimated ? 1 : 0,
            transform: hasAnimated ? 'translateY(0)' : 'translateY(40px)',
            filter: hasAnimated ? 'blur(0px)' : 'blur(10px)',
            transition: `all 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
        }}>
            <div className="opinion-text-wrapper">
                <p className="opinion-name" style={{
                    color: '#FD9731',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    textTransform: 'none',
                    fontSize: 'clamp(13px, 1.2vw, 15px)',
                    margin: 0
                }}>
                    {card.title}
                </p>
                <p className="opinion-desc" style={{
                    color: 'rgba(245,245,245,0.7)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '400',
                    margin: 0
                }}>
                    {card.text}
                </p>
            </div>
            <div className="opinion-dot" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
        </div>
    );
}

// Opinion Card - Right
function OpinionCardRight({ delay = 0, hasAnimated, cardIndex }) {
    const card = TRUST_CARDS[cardIndex] || TRUST_CARDS[1];
    return (
        <div className="opinion-card opinion-card-right" style={{
            opacity: hasAnimated ? 1 : 0,
            transform: hasAnimated ? 'translateY(0)' : 'translateY(40px)',
            filter: hasAnimated ? 'blur(0px)' : 'blur(10px)',
            transition: `all 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
        }}>
            <div className="opinion-dot" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <div className="opinion-text-wrapper">
                <p className="opinion-name" style={{
                    color: '#FD9731',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    textTransform: 'none',
                    fontSize: 'clamp(13px, 1.2vw, 15px)',
                    margin: 0
                }}>
                    {card.title}
                </p>
                <p className="opinion-desc" style={{
                    color: 'rgba(245,245,245,0.7)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: '400',
                    margin: 0
                }}>
                    {card.text}
                </p>
            </div>
        </div>
    );
}

export function TrustSection() {
    const sectionRef = useRef(null);
    const carContainerRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // ✅ Czy sekcja jest w viewport
    const [scrollProgress, setScrollProgress] = useState(0);

    // Wstrzyknięcie stylów
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    // ✅ Jeden observer robi dwie rzeczy: trigger animacji (0.2) i visibility tracking
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            },
            { threshold: 0.05, rootMargin: '100px' }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, [hasAnimated]);

    // ✅ Scroll listener tylko gdy sekcja jest w viewport
    useEffect(() => {
        if (!isVisible) return;

        const handleScroll = () => {
            if (!carContainerRef.current) return;
            const rect = carContainerRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const progress = Math.max(0, Math.min(1,
                (windowHeight - rect.top) / (windowHeight + rect.height)
            ));
            setScrollProgress(progress);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isVisible]);

    const count1 = useCounter(2200, 2500, hasAnimated);
    const count2 = useCounter(99, 2500, hasAnimated);

    const lineTopLeft = {
        svgProps: { width: "160", height: "813", viewBox: "0 0 160 813", fill: "none" },
        path: "M0 1.35064C26.2107 1.35066 59.1851 -0.975541 77.2263 6.35072C114.937 21.6645 135.053 39.3507 148.5 87.8507C167.461 140.657 153 769.679 153 812.351"
    };
    const lineTopRight = {
        svgProps: { width: "160", height: "866", viewBox: "0 0 160 866", fill: "none" },
        path: "M159.276 1.35064C133.066 1.35066 100.091 -0.975541 82.0501 6.35072C44.3393 21.6645 24.2235 39.3507 10.7764 87.8507C-8.18513 140.657 6.27637 822.828 6.27637 865.5"
    };
    const lineBottomLeft = {
        svgProps: { width: "157", height: "420", viewBox: "0 0 157 420", fill: "none" },
        path: "M0 1.35064C26.2107 1.35066 59.1851 -0.975541 77.2263 6.35072C114.937 21.6645 135.053 39.3507 148.5 87.8507C167.461 140.657 153 769.679 153 812.351"
    };
    const lineBottomRight = {
        svgProps: { width: "157", height: "467", viewBox: "0 0 157 467", fill: "none" },
        path: "M159.276 1.35064C133.066 1.35066 100.091 -0.975541 82.0501 6.35072C44.3393 21.6645 24.2235 39.3507 10.7764 87.8507C-8.18513 140.657 6.27637 822.828 6.27637 865.5"
    };

    return (
        <section ref={sectionRef} className="trust-section">
            <div className="main-container">
                {/* Stats + Title Section */}
                <div className="stats-wrapper">
                    <div className="stats-box" style={{
                        opacity: hasAnimated ? 1 : 0,
                        transform: hasAnimated ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(30px)',
                        filter: hasAnimated ? 'blur(0px)' : 'blur(10px)',
                    }}>
                        <div className="stat-item">
                            <p className="stat-label" style={{ color: '#F7F7F7', fontWeight: '500', margin: 0 }}>Ponad</p>
                            <p className="stat-number" aria-label={`${count1} sprowadzonych aut`} style={{
                                color: 'transparent',
                                fontFamily: '"Monument Extended"',
                                fontWeight: '500',
                                margin: 0,
                                WebkitTextStroke: '2px #FD9731',
                                textShadow: '0px 0px 39.5px rgba(253, 151, 49, 0.50)',
                                filter: 'drop-shadow(0px 0px 30px rgba(253, 151, 49, 0.6))'
                            }}>{count1}</p>
                            <p className="stat-desc" style={{ color: '#F7F7F7', fontWeight: '400', margin: 0 }}>
                                sprowadzonych aut od 2018 roku
                            </p>
                        </div>

                        <div className="stat-divider" />

                        <div className="stat-item">
                            <p className="stat-label" style={{ color: '#F7F7F7', fontWeight: '500', margin: 0 }}>Blisko</p>
                            <p className="stat-number" aria-label={`${count2}% zadowolonych klientów`} style={{
                                color: 'transparent',
                                fontFamily: '"Monument Extended"',
                                fontWeight: '500',
                                margin: 0,
                                WebkitTextStroke: '2px #FD9731',
                                textShadow: '0px 0px 39.5px rgba(253, 151, 49, 0.50)',
                                filter: 'drop-shadow(0px 0px 30px rgba(253, 151, 49, 0.6))'
                            }}>{count2}%</p>
                            <p className="stat-desc" style={{ color: '#F7F7F7', fontWeight: '400', margin: 0 }}>
                                zadowolonych klientów
                            </p>
                        </div>
                    </div>

                    <h2 className="main-title" style={{
                        fontFamily: 'Inter, sans-serif',  /* Inter — spójność z brandingiem */
                        fontWeight: '700',
                        letterSpacing: '-0.5px',
                        background: 'linear-gradient(90deg, rgba(247, 247, 247, 0.80) 0%, #FFF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0,
                        opacity: hasAnimated ? 1 : 0,
                        transform: hasAnimated ? 'translateY(0)' : 'translateY(30px)',
                        filter: hasAnimated ? 'blur(0px)' : 'blur(8px)',
                        transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
                    }}>
                        Dlaczego warto sprowadzić auto<br />z USA lub Kanady
                    </h2>
                </div>

                {/* Car Stage Container */}
                <div ref={carContainerRef} className="car-stage">
                    <div className="opinions-column">
                        <OpinionCardLeft delay={0.6} hasAnimated={hasAnimated} cardIndex={0} />
                        <OpinionCardLeft delay={0.9} hasAnimated={hasAnimated} cardIndex={2} />
                    </div>

                    {/* Auto bez tła — wycentrowane pod liniami, delikatny parallax */}
                    <div className="car-image-container" style={{
                        opacity: hasAnimated ? 1 : 0,
                        transition: hasAnimated ? 'opacity 1.4s ease 0.4s' : 'none',
                    }}>
                        <Image
                            src="/Photo/Glowna/Auto_bez_tla.webp"
                            alt="Samochód importowany z USA"
                            fill
                            className="car-image"
                            sizes="(max-width: 900px) 100vw, 1200px"
                            priority={false}
                        />
                    </div>

                    <div className="opinions-column">
                        <OpinionCardRight delay={0.7} hasAnimated={hasAnimated} cardIndex={1} />
                        <OpinionCardRight delay={1.0} hasAnimated={hasAnimated} cardIndex={3} />
                    </div>

                    <AnimatedLine
                        pathData={lineTopLeft}
                        gradientId="grad_top_left"
                        position={{ top: '0', width: '158px', height: '811px' }}
                        isLeft={true}
                        hasAnimated={hasAnimated}
                    />
                    <AnimatedLine
                        pathData={lineTopRight}
                        gradientId="grad_top_right"
                        position={{ top: '0', width: '158px', height: '865px' }}
                        isLeft={false}
                        hasAnimated={hasAnimated}
                    />
                    <AnimatedLine
                        pathData={lineBottomLeft}
                        gradientId="grad_bottom_left"
                        position={{ top: '280px', width: '100px', height: '420px' }}
                        isLeft={true}
                        hasAnimated={hasAnimated}
                    />
                    <AnimatedLine
                        pathData={lineBottomRight}
                        gradientId="grad_bottom_right"
                        position={{ top: '260px', width: '130px', height: '467px' }}
                        isLeft={false}
                        hasAnimated={hasAnimated}
                    />


                </div>
            </div>
        </section>
    );
}