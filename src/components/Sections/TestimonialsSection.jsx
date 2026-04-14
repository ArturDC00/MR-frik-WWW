import React, { useRef, useEffect, useState } from 'react';

const REVIEWS = [
    {
        id: 1,
        name: 'Hubert N.',
        city: 'Polska',
        car: 'Import z USA',
        rating: 5,
        text: 'Chłopaki robią super robotę - zawsze doradzą, pomogą i ogarną wszystko od A do Z. Współpraca bez stresu i pełne zaufanie.',
        date: '2025',
        verified: true,
    },
    {
        id: 2,
        name: 'Maciej C.',
        city: 'Polska',
        car: 'Import z USA',
        rating: 5,
        text: 'Co tu dużo mówić… Ekipa MrFrik naprawdę spełnia marzenia. Wystarczy, że rzucisz im hasło, że marzy Ci się jakieś auto - ale może za kilka lat, bo brakuje funduszy - a tu nagle dzwonią i mówią, że mają Twoje wymarzone auto za ułamek ceny! Świetny kontakt i wszystko jasno wyjaśnione. Zero zaskoczeń, zero rozczarowań, a samochód po naprawie to po prostu czysta poezja.',
        date: '2025',
        verified: true,
    },
    {
        id: 3,
        name: 'Bogusław Cz.',
        city: 'Polska',
        car: 'Import z USA',
        rating: 5,
        text: 'Super sprawa. Firma rzetelna, stały kontakt, zdjęcia z aukcji i przed załadunkiem. Żadnych dodatkowych ukrytych opłat. Z czystym sumieniem mogę polecić.',
        date: '2025',
        verified: true,
    },
    {
        id: 4,
        name: 'Piotr R.',
        city: 'Wrocław',
        car: 'Dodge Challenger R/T 2021',
        rating: 5,
        text: 'Już drugie auto sprowadzone przez MrFrika. Za każdym razem idealnie. Challenger R/T wylicytowany za ułamek europejskiej ceny, po 8 tygodniach stoi w moim garażu.',
        date: 'Styczeń 2026',
    },
    {
        id: 5,
        name: 'Anna S.',
        city: 'Gdańsk',
        car: 'Chevrolet Corvette C8 2022',
        rating: 5,
        text: 'Corvette C8 z Kanady — moje marzenie spełnione. Nie wierzyłam że to możliwe w takiej cenie. Cały proces trwał 9 tygodni, dokumenty przyszły kompletne. Niesamowita obsługa.',
        date: 'Grudzień 2025',
    },
    {
        id: 6,
        name: 'Kamil D.',
        city: 'Poznań',
        car: 'Tesla Model S Plaid 2023',
        rating: 5,
        text: 'Import elektryka z USA to osobna kategoria — cła, akcyza, homologacja. MrFrik przeprowadził mnie przez wszystko. Tesla Plaid teraz jeździ po Polsce z pełną dokumentacją.',
        date: 'Luty 2026',
    },
];

function StarRating({ rating }) {
    return (
        <div style={{ display: 'flex', gap: '3px' }} aria-label={`Ocena ${rating} na 5`}>
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                        d="M7 1L8.5 5H13L9.5 7.5L11 11.5L7 9L3 11.5L4.5 7.5L1 5H5.5L7 1Z"
                        fill={i <= rating ? '#FD9731' : 'rgba(253,151,49,0.18)'}
                    />
                </svg>
            ))}
        </div>
    );
}

function ReviewCard({ review }) {
    return (
        <article className="tr-card">
            <div className="tr-card-top">
                <div className="tr-avatar" aria-hidden="true">
                    {review.name.charAt(0)}
                </div>
                <div>
                    <p className="tr-name">{review.name}</p>
                    <p className="tr-location">{review.city}</p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <StarRating rating={review.rating} />
                    <span className="tr-date">{review.date}</span>
                </div>
            </div>

            <p className="tr-car">{review.car}</p>

            <blockquote className="tr-text">
                &ldquo;{review.text}&rdquo;
            </blockquote>
        </article>
    );
}

export function TestimonialsSection() {
    const trackRef = useRef(null);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(true);

    const updateArrows = () => {
        const t = trackRef.current;
        if (!t) return;
        setCanPrev(t.scrollLeft > 8);
        setCanNext(t.scrollLeft < t.scrollWidth - t.clientWidth - 8);
    };

    useEffect(() => {
        const t = trackRef.current;
        if (!t) return;
        t.addEventListener('scroll', updateArrows, { passive: true });
        updateArrows();
        return () => t.removeEventListener('scroll', updateArrows);
    }, []);

    const scroll = (dir) => {
        const t = trackRef.current;
        if (!t) return;
        const card = t.querySelector('.tr-card');
        const cardW = card ? card.offsetWidth + 20 : 340;
        t.scrollBy({ left: dir * cardW, behavior: 'smooth' });
    };

    // Aggregate stats
    const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

    return (
        <section className="tr-section" id="section-reviews" aria-label="Opinie klientów">
            <style>{`
                .tr-section {
                    position: relative;
                    background: #020203;
                    width: 100%;
                    padding: 80px 0 60px;
                    overflow: hidden;
                }
                @media (min-width: 1024px) {
                    .tr-section { padding: 120px 0 80px; }
                }

                /* HEADER */
                .tr-header {
                    padding: 0 clamp(20px, 5vw, 80px);
                    max-width: 1512px;
                    margin: 0 auto 48px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 24px;
                }
                .tr-title {
                    font-family: 'Monument Extended', sans-serif;
                    font-size: clamp(28px, 4vw, 62px);
                    font-weight: 400;
                    line-height: 1.2;
                    letter-spacing: 0.04em;
                    background: linear-gradient(90deg, rgba(247,247,247,.60) 0%, #FFF 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                }
                .tr-aggregate {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-shrink: 0;
                }
                .tr-agg-score {
                    font-family: 'Monument Extended', sans-serif;
                    font-size: 42px;
                    font-weight: 400;
                    color: #FD9731;
                    line-height: 1;
                }
                .tr-agg-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .tr-agg-label {
                    font-family: Inter, sans-serif;
                    font-size: 13px;
                    color: rgba(245,245,245,0.75);
                    letter-spacing: 0.5px;
                }

                /* SCROLL TRACK */
                .tr-track-wrap {
                    position: relative;
                }
                .tr-track {
                    display: flex;
                    gap: 20px;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 4px clamp(20px, 5vw, 80px) 20px;
                    -webkit-overflow-scrolling: touch;
                }
                .tr-track::-webkit-scrollbar { display: none; }

                /* FADE EDGES */
                .tr-fade-left,
                .tr-fade-right {
                    position: absolute;
                    top: 0; bottom: 0;
                    width: 80px;
                    pointer-events: none;
                    z-index: 2;
                    transition: opacity 0.3s ease;
                }
                .tr-fade-left {
                    left: 0;
                    background: linear-gradient(90deg, #020203 0%, transparent 100%);
                }
                .tr-fade-right {
                    right: 0;
                    background: linear-gradient(-90deg, #020203 0%, transparent 100%);
                }

                /* CARD */
                .tr-card {
                    flex: 0 0 clamp(280px, 80vw, 380px);
                    scroll-snap-align: start;
                    background: rgba(21, 32, 60, 0.25);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    transition: border-color 0.3s ease, transform 0.3s ease;
                }
                .tr-card:hover {
                    border-color: rgba(253,151,49,0.2);
                    transform: translateY(-2px);
                }

                .tr-card-top {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .tr-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(253,151,49,0.3) 0%, rgba(207,106,5,0.3) 100%);
                    border: 1px solid rgba(253,151,49,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Monument Extended', sans-serif;
                    font-size: 16px;
                    color: #FD9731;
                    flex-shrink: 0;
                }
                .tr-name {
                    font-family: Inter, sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    color: #F5F5F5;
                    margin: 0;
                    line-height: 1.3;
                }
                .tr-location {
                    font-family: Inter, sans-serif;
                    font-size: 12px;
                    color: rgba(245,245,245,0.7);
                    margin: 0;
                    margin-top: 2px;
                }
                .tr-date {
                    font-family: Inter, sans-serif;
                    font-size: 11px;
                    color: rgba(245,245,245,0.65);
                    letter-spacing: 0.3px;
                }
                .tr-car {
                    font-family: Inter, sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    color: #FD9731;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    margin: 0;
                    padding: 6px 12px;
                    background: rgba(253,151,49,0.07);
                    border-radius: 6px;
                    border: 1px solid rgba(253,151,49,0.12);
                    width: fit-content;
                }
                .tr-text {
                    font-family: Inter, sans-serif;
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 1.65;
                    color: rgba(245,245,245,0.65);
                    margin: 0;
                    flex: 1;
                }

                /* NAVIGATION ARROWS */
                .tr-nav {
                    padding: 0 clamp(20px, 5vw, 80px);
                    max-width: 1512px;
                    margin: 24px auto 0;
                    display: flex;
                    gap: 12px;
                }
                .tr-arrow {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(21,32,60,0.4);
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: rgba(245,245,245,0.75);
                }
                .tr-arrow:hover:not(:disabled) {
                    background: rgba(253,151,49,0.12);
                    border-color: rgba(253,151,49,0.4);
                    color: #FD9731;
                }
                .tr-arrow:disabled {
                    opacity: 0.25;
                    cursor: default;
                }
            `}</style>

            <div className="tr-header">
                <h2 className="tr-title">Opinie klientów</h2>
                <div className="tr-aggregate" aria-label={`Średnia ocena ${avgRating} z 5 na podstawie ponad 1500 opinii`}>
                    <span className="tr-agg-score">{avgRating}</span>
                    <div className="tr-agg-info">
                        <StarRating rating={5} />
                        <span className="tr-agg-label">Ponad 1500 klientów</span>
                    </div>
                </div>
            </div>

            <div className="tr-track-wrap">
                <div className="tr-fade-left" style={{ opacity: canPrev ? 1 : 0 }} aria-hidden="true" />
                <div className="tr-track" ref={trackRef}>
                    {REVIEWS.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
                <div className="tr-fade-right" style={{ opacity: canNext ? 1 : 0 }} aria-hidden="true" />
            </div>

            <div className="tr-nav">
                <button
                    className="tr-arrow"
                    onClick={() => scroll(-1)}
                    disabled={!canPrev}
                    aria-label="Poprzednia opinia"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <button
                    className="tr-arrow"
                    onClick={() => scroll(1)}
                    disabled={!canNext}
                    aria-label="Następna opinia"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </section>
    );
}
