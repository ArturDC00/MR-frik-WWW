import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ProcessSection() {
    const sectionRef = useRef(null);
    const pinRef = useRef(null);
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            id: 0,
            isIntro: true,
            title: "Jak sprowadzamy Twoje auto w",
            highlight: "4 PROSTYCH KROKACH",
            image: "/Photo/Glowna/AdobeStock_850099459.webp"
        },
        {
            id: 1,
            number: "01",
            title: "Wybór auta",
            description: "Pomagamy znaleźć najlepsze oferty na aukcjach samochodowych w USA i Kanadzie. Doradzamy przy wyborze modelu, rocznika i wersji wyposażenia, aby dopasować auto do Twojego budżetu.",
            image: "/Photo/Glowna/AdobeStock_662220829.webp"
        },
        {
            id: 2,
            number: "02",
            title: "Weryfikacja pojazdu",
            description: "Dokładnie sprawdzamy historię auta po numerze VIN, analizujemy zdjęcia aukcyjne i raporty. Dzięki temu minimalizujemy ryzyko i pomagamy uniknąć nieopłacalnych ofert.",
            image: "/Photo/Glowna/AdobeStock_1834142693.webp"
        },
        {
            id: 3,
            number: "03",
            title: "Transport i odprawa",
            description: "Organizujemy cały proces logistyczny – transport lądowy w USA lub Kanadzie, transport morski do Europy oraz odprawę celną.",
            image: "/Photo/Glowna/AdobeStock_1764488348.webp"
        },
        {
            id: 4,
            number: "04",
            title: "Dostawa pod dom",
            description: "Po zakończeniu procesu dostarczamy samochód pod wskazany adres. Odbierasz kluczyki oraz komplet dokumentów potrzebnych do dalszych formalności.",
            image: "/Photo/Glowna/AdobeStock_976875836.webp"
        }
    ];

    useEffect(() => {
        const section = sectionRef.current;
        const pinContent = pinRef.current;

        if (!section || !pinContent) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                pin: pinContent,
                // Gdy użytkownik preferuje zredukowany ruch — brak opóźnienia scrub
                scrub: prefersReducedMotion ? true : 2,
                onUpdate: (self) => {
                    const stepCount = steps.length;
                    const rawStep = self.progress * stepCount;
                    const currentStep = Math.min(Math.floor(rawStep), stepCount - 1);
                    setActiveStep(currentStep);
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [steps.length]);

    return (
        <section ref={sectionRef} className="process-track">
            <style>{`
                /* --- SETUP --- */
                .process-track {
                    width: 100%;
                    height: 350vh;
                    background: #000000;
                    position: relative;
                    z-index: 10;
                    margin: 0;
                    padding: 0;
                }

                @media (min-width: 768px) {
                    .process-track {
                        height: 500vh;
                    }
                }

                .process-view {
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    position: relative;
                }

                .layout-grid {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column-reverse;
                }

                @media (min-width: 1024px) {
                    .layout-grid {
                        flex-direction: row;
                        /* Usunięto padding-left — powodował czarny pasek po lewej
                         * Margines obsługiwany przez left-column padding */
                        padding-left: 0;
                    }
                }

                /* --- LEWA STRONA (KARTA TEKSTU) --- */
                .left-column {
                    flex: 1;
                    min-height: 45%; /* Mobile */
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                }

                @media (min-width: 1024px) {
                    .left-column {
                        height: 100%;
                        flex: 0 0 55%;
                        max-width: 55%;
                        justify-content: flex-start;
                        /* Brak padding-left — karta rozciąga się od krawędzi ekranu */
                        padding-left: 0;
                        padding-right: 0;
                    }
                }

                .content-card {
                    width: 100%;
                    max-width: 692px; /* Domyślna szerokość */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;

                    /* MOBILE STYLE */
                    background: radial-gradient(55.75% 101.33% at 0% 50%, #102044 0%, #191919 100%);
                    border-radius: 18px 18px 0 0;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-bottom: none;
                    padding: 24px 20px;
                }

                @media (min-width: 1024px) {
                    .content-card {
                        height: 100%;
                        width: 100%;
                        /* Karta wypełnia całą lewą kolumnę do krawędzi ekranu */
                        max-width: 100%;

                        /* DESKTOP STYLE — rozciąga się do lewej krawędzi */
                        background: linear-gradient(90deg, #102044 0%, #191919 70%, #000000 100%);

                        /* Brak left border-radius — karta idzie do krawędzi ekranu */
                        border-radius: 0;
                        border: none;
                        border-right: none;

                        /* Padding wewnętrzny od lewej — daje "oddech" tekstowi */
                        padding: 40px 40px 60px clamp(40px, 5vw, 100px);
                    }
                }

                /* --- HEADER --- */
                .section-header {
                    margin-bottom: 40px;
                    text-align: center;
                    width: 100%;
                }

                .header-label {
                    color: #F5F5F5;
                    font-family: 'Inter', sans-serif;
                    font-size: 25px;
                    font-weight: 400;
                    line-height: 40px;
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                    margin-bottom: 24px;
                    display: block;
                }

                .header-divider {
                    width: 92px;
                    height: 1px;
                    background: #FD9731;
                    margin: 0 auto;
                }

                /* --- INTRO VIEW (Step 0) --- */
                .intro-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    width: 100%;
                }

                /* NAGŁÓWEK INTRO
                 * Klient: "w" przenieść do linijki z "4 prostych krokach", czyli:
                 * Jak sprawdzamy Twoje auto
                 * w 4 PROSTYCH KROKACH
                 */
                .intro-title-block {
                    font-family: 'Inter', sans-serif;
                    text-align: left;
                    margin: 0;
                }

                /* Linia 1: "Jak sprawdzamy Twoje auto" */
                .intro-text-white {
                    color: #F5F5F5;
                    font-weight: 700;
                    display: block; /* Własna linia */
                    font-size: clamp(20px, 5vw, 28px);
                    line-height: 1.3;
                }

                /* Linia 2: "w 4 PROSTYCH KROKACH" — "w" na tej samej linii co highlight */
                .intro-text-orange-line {
                    display: block; /* Nowa linia */
                    margin-top: 5px;
                    font-size: clamp(20px, 5vw, 28px);
                    line-height: 1.3;
                    font-weight: 700;
                }

                .intro-text-w {
                    color: #F5F5F5; /* białe "w" */
                    font-weight: 700;
                }

                .intro-text-orange {
                    color: #FD9731;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                @media (min-width: 1024px) {
                    .intro-text-white {
                        font-size: 39px;
                        line-height: 64px;
                    }
                    .intro-text-orange-line {
                        font-size: 39px;
                        line-height: 64px;
                    }
                }

                /* LISTA KROKÓW INTRO */
                .intro-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .intro-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .intro-num {
                    color: rgba(127, 127, 127, 0.50);
                    font-family: 'Inter', sans-serif;
                    font-size: 30px;
                    font-weight: 400;
                    line-height: 48px;
                    width: 40px;
                    text-align: center;
                    flex-shrink: 0;
                }

                .intro-sep {
                    width: 1px;
                    height: 30px;
                    background: #7F7F7F; /* PIONOWA LINIA */
                }

                .intro-text {
                    color: rgba(127, 127, 127, 0.50);
                    font-family: 'Inter', sans-serif;
                    font-size: 25px;
                    font-weight: 400;
                    line-height: 64px;
                }

                /* --- LISTA KROKÓW (Step 1-4) --- */
                .steps-list {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .step-row {
                    display: flex;
                    gap: 30px;
                    position: relative;
                    padding-bottom: 0; 
                }

                .num-col {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 66px;
                    flex-shrink: 0;
                }

                /* Cyfra nieaktywna */
                .step-num {
                    font-family: 'Inter', sans-serif;
                    font-size: 30px;
                    font-weight: 400;
                    line-height: 48px;
                    color: rgba(127, 127, 127, 0.50);
                    text-align: center;
                    transition: all 0.5s ease;
                    z-index: 2;
                }

                /* Cyfra AKTYWNA */
                .step-row.active .step-num {
                    font-size: 66px; /* 60px + 6pkt */
                    color: transparent;
                    -webkit-text-stroke: 1px #FD9731;
                    filter: drop-shadow(0 0 10px rgba(253, 151, 49, 0.4));
                    font-weight: 500;
                    line-height: 1;
                    padding: 5px 0;
                }

                .step-line {
                    width: 1px;
                    flex-grow: 1;
                    min-height: 40px;
                    background: #7F7F7F;
                    opacity: 0.5;
                    margin-top: 5px;
                    margin-bottom: 5px;
                }
                
                .step-row:last-child .step-line {
                    display: none;
                }

                .text-col {
                    padding-top: 0; 
                    padding-bottom: 30px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .step-row.active .text-col {
                    justify-content: flex-start;
                    padding-top: 10px;
                }

                .step-title {
                    color: rgba(127, 127, 127, 0.50);
                    font-family: 'Inter', sans-serif;
                    font-size: 25px;
                    font-weight: 400;
                    line-height: 1.2;
                    margin: 0;
                    transition: all 0.5s ease;
                }

                .step-row.active .step-title {
                    color: #FD9731;
                    font-weight: 700;
                    font-size: 32px;
                    line-height: 1.2;
                    margin-bottom: 16px;
                }

                .step-desc {
                    color: #F5F5F5;
                    font-family: 'Inter', sans-serif;
                    font-size: 18px;
                    line-height: 1.6;
                    opacity: 0;
                    max-height: 0;
                    overflow: hidden;
                    transition: all 0.5s ease;
                }

                .step-row.active .step-desc {
                    opacity: 1;
                    max-height: 200px;
                }

                /* --- PRAWA STRONA (ZDJĘCIA) --- */
                .right-column {
                    width: 100%;
                    height: 45%; /* Mobile */
                    position: relative;
                    overflow: hidden;
                }

                @media (min-width: 1024px) {
                    .right-column {
                        height: 100%;
                        flex: 1; /* Wypełnia resztę ekranu */
                    }
                }

                .image-stack {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .proc-img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    /* Kadrowanie: górna część samochodu widoczna na mobile */
                    object-position: center center;
                    opacity: 0;
                    transition: opacity 1s ease-in-out;
                }

                /* Na mobile wykadruj tak żeby auto było centralnie */
                @media (max-width: 1023px) {
                    .proc-img {
                        object-position: center 40%;
                    }
                }

                .proc-img.visible { opacity: 1; }

                /* BLEND OVERLAY */
                .img-blend-overlay {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background: linear-gradient(0deg, #000000 10%, transparent 60%);
                }

                @media (min-width: 1024px) {
                    .img-blend-overlay {
                        /* Gradient od lewej (czarny) do prawej (transparent) */
                        background: linear-gradient(90deg, #000000 0%, transparent 50%);
                    }
                }

                /* ── MOBILE REDESIGN (< 1024px) ──────────────────────────────────
                 * Zamiast stacka wszystkich kroków pokazujemy tylko AKTYWNY krok.
                 * Układ: zdjęcie NA GÓRZE (42vh), karta NA DOLE (58vh).
                 * desktop-steps-wrap jest ukryty → zastąpiony przez mob-card.
                 * ─────────────────────────────────────────────────────────────── */
                @media (max-width: 1023px) {
                    .layout-grid { flex-direction: column-reverse; }
                    .right-column { height: 42vh; flex-shrink: 0; }
                    .left-column {
                        flex: 1;
                        height: 58vh;
                        overflow: hidden;
                        align-items: stretch;
                    }
                    .content-card {
                        height: 100%;
                        width: 100%;
                        max-width: 100%;
                        padding: 0;
                        border-radius: 0;
                        border: none;
                        background: #000;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    /* Ukryj desktop-only treść na mobile */
                    .desktop-steps-wrap { display: none; }
                }

                /* ── MOB CARD: widoczna TYLKO na mobile ─────────────── */
                .mob-card {
                    display: none;
                }

                @media (max-width: 1023px) {
                    .mob-card {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        padding: 22px 24px 20px;
                        overflow: hidden;
                        position: relative;
                    }
                }

                /* Label (PROCES IMPORTU) */
                .mob-label {
                    font-family: 'Inter', sans-serif;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #FD9731;
                    margin-bottom: 4px;
                    flex-shrink: 0;
                }

                /* ── INTRO (step 0) ── */
                .mob-intro {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    overflow: hidden;
                }

                .mob-intro-title {
                    font-family: 'Inter', sans-serif;
                    font-size: clamp(20px, 5.5vw, 26px);
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.25;
                    margin: 0 0 20px;
                }

                .mob-intro-orange { color: #FD9731; }

                .mob-intro-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .mob-intro-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .mob-intro-num {
                    font-family: 'Inter', sans-serif;
                    font-size: 11px;
                    font-weight: 700;
                    color: #FD9731;
                    letter-spacing: 1.5px;
                    width: 22px;
                    flex-shrink: 0;
                }

                .mob-intro-sep {
                    width: 1px;
                    height: 14px;
                    background: rgba(255,255,255,0.15);
                    flex-shrink: 0;
                }

                .mob-intro-name {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 400;
                    color: rgba(255,255,255,0.55);
                    line-height: 1.3;
                }

                /* ── STEP (1–4) ── */
                .mob-step {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    overflow: hidden;
                }

                .mob-counter {
                    font-family: 'Inter', sans-serif;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 2.5px;
                    color: #FD9731;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                    flex-shrink: 0;
                }

                .mob-step-title {
                    font-family: 'Inter', sans-serif;
                    font-size: clamp(24px, 6.5vw, 30px);
                    font-weight: 700;
                    color: #fff;
                    line-height: 1.2;
                    margin: 0 0 12px;
                    flex-shrink: 0;
                }

                .mob-step-desc {
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 400;
                    color: rgba(255,255,255,0.6);
                    line-height: 1.65;
                    margin: 0;
                    overflow: hidden;
                }

                /* ── PROGRESS PILLS ── */
                .mob-pills {
                    display: flex;
                    gap: 6px;
                    padding-top: 14px;
                    flex-shrink: 0;
                }

                .mob-pill {
                    height: 4px;
                    width: 20px;
                    border-radius: 2px;
                    background: rgba(255,255,255,0.15);
                    transition: width 0.4s ease, background 0.4s ease;
                    flex-shrink: 0;
                }

                .mob-pill.act {
                    background: #FD9731;
                    width: 36px;
                }

            `}</style>

            <div ref={pinRef} className="process-view">
                <div className="layout-grid">

                    {/* LEWA STRONA (TEKST) */}
                    <div className="left-column">
                        <div className="content-card">

                            {/* ── DESKTOP ONLY: intro + stacked steps list ── */}
                            <div className="desktop-steps-wrap" style={{ width: '100%' }}>

                                {/* WIDOK INTRO */}
                                <div style={{
                                    display: activeStep === 0 ? 'block' : 'none',
                                    opacity: activeStep === 0 ? 1 : 0,
                                    transition: 'opacity 0.5s',
                                    width: '100%'
                                }}>
                                    <div className="section-header">
                                        <span className="header-label" aria-hidden="true">PROCES IMPORTU SAMOCHODU</span>
                                        <div className="header-divider" aria-hidden="true" />
                                    </div>
                                    <div className="intro-wrap">
                                        <div className="intro-title-block">
                                            <h2 className="intro-text-white" style={{ margin: 0 }}>Jak sprowadzamy Twoje auto</h2>
                                            <span className="intro-text-orange-line">
                                                <span className="intro-text-w">w </span>
                                                <span className="intro-text-orange">4 PROSTYCH KROKACH</span>
                                            </span>
                                        </div>
                                        <div className="intro-list">
                                            {steps.slice(1).map((s, i) => (
                                                <div key={i} className="intro-item">
                                                    <span className="intro-num">{s.number}</span>
                                                    <div className="intro-sep" aria-hidden="true" />
                                                    <span className="intro-text">{s.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* WIDOK KROKÓW */}
                                <div style={{
                                    display: activeStep > 0 ? 'block' : 'none',
                                    opacity: activeStep > 0 ? 1 : 0,
                                    transition: 'opacity 0.5s',
                                    width: '100%'
                                }}>
                                    <div className="section-header">
                                        <span className="header-label">PROCES IMPORTU SAMOCHODU</span>
                                        <div className="header-divider" />
                                    </div>
                                    <div className="steps-list">
                                        {steps.slice(1).map((step) => {
                                            const isActive = activeStep === step.id;
                                            return (
                                                <div key={step.id} className={`step-row ${isActive ? 'active' : ''}`}>
                                                    <div className="num-col">
                                                        <span className="step-num">{step.number}</span>
                                                        <div className="step-line" aria-hidden="true" />
                                                    </div>
                                                    <div className="text-col">
                                                        <h3 className="step-title">{step.title}</h3>
                                                        <div className="step-desc">{step.description}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>{/* end desktop-steps-wrap */}

                            {/* ── MOBILE ONLY: single-step Apple-like card ── */}
                            <div className="mob-card">

                                <span className="mob-label">PROCES IMPORTU</span>

                                {/* Intro (step 0) */}
                                {activeStep === 0 && (
                                    <div className="mob-intro">
                                        <h2 className="mob-intro-title">
                                            Jak sprowadzamy Twoje auto{' '}
                                            <span className="mob-intro-orange">w 4 prostych krokach</span>
                                        </h2>
                                        <div className="mob-intro-list">
                                            {steps.slice(1).map((s) => (
                                                <div key={s.id} className="mob-intro-item">
                                                    <span className="mob-intro-num">{s.number}</span>
                                                    <div className="mob-intro-sep" />
                                                    <span className="mob-intro-name">{s.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Active step (1–4) */}
                                {activeStep > 0 && (
                                    <div className="mob-step">
                                        <span className="mob-counter">{steps[activeStep].number} / 04</span>
                                        <h2 className="mob-step-title">{steps[activeStep].title}</h2>
                                        <p className="mob-step-desc">{steps[activeStep].description}</p>
                                    </div>
                                )}

                                {/* Progress pills */}
                                <div className="mob-pills">
                                    {steps.slice(1).map((s, i) => (
                                        <div key={s.id} className={`mob-pill${activeStep === i + 1 ? ' act' : ''}`} />
                                    ))}
                                </div>

                            </div>{/* end mob-card */}

                        </div>
                    </div>

                    {/* PRAWA STRONA (ZDJĘCIA) */}
                    <div className="right-column">
                        <div className="image-stack">
                            {steps.map((step, index) => (
                                <Image
                                    key={step.id}
                                    src={step.image}
                                    alt={step.title}
                                    className={`proc-img ${activeStep === index ? 'visible' : ''}`}
                                    fill
                                    sizes="(max-width: 1023px) 100vw, 50vw"
                                    style={{ objectFit: 'cover', objectPosition: 'center center' }}
                                />
                            ))}
                            {/* Overlay łączący zdjęcie z czernią karty */}
                            <div className="img-blend-overlay" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}