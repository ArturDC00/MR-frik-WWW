import React, { useState } from 'react';
import Image from 'next/image';

// Nowe dane FAQ z Twoimi tekstami i dopasowanymi zdjęciami
const faqData = [
    {
        id: 1,
        question: "Czy mogę sam wybrać auto z aukcji w USA lub Kanadzie?",
        answer: "Tak, oczywiście! To Ty decydujesz, jakie auto chcesz sprowadzić. Wspólnie analizujemy oferty z popularnych aukcji (np. Copart, IAAI, Impact Auto oraz aukcji dealerskich), a następnie pomagamy Ci wybrać najkorzystniejsze opcje. Należy jednak pamiętać, że aukcje mają charakter licytacji, dlatego może się zdarzyć, że ktoś przebije naszą ofertę. W takiej sytuacji natychmiast szukamy innego, równie atrakcyjnego egzemplarza. Naszym celem jest znalezienie samochodu, który w pełni spełni Twoje oczekiwania – zarówno pod względem stanu technicznego, jak i ceny.",
        image: "/Photo/Baza wiedzy/AdobeStock_939121444.webp"
    },
    {
        id: 2,
        question: "Ile kosztuje sprowadzenie auta z USA lub Kanady do Polski?",
        answer: "Całkowity koszt importu auta z USA lub Kanady zależy od kilku czynników: ceny wylicytowanego samochodu (a co za tym idzie różnicy w kosztach aukcyjnych), kosztów transportu lądowego oraz morskiego, opłat celnych, akcyzy oraz ewentualnych napraw. Informujemy Cię o kosztach sprowadzenia auta jeszcze przed rozpoczęciem procesu, abyś dokładnie wiedział, z jakim budżetem musisz się liczyć.",
        image: "/Photo/Baza wiedzy/AdobeStock_273643099.webp"
    },
    {
        id: 3,
        question: "Jak długo trwa sprowadzenie samochodu?",
        answer: "Średni czas importu auta zza oceanu wynosi od 6 do 10 tygodni, w zależności od miejsca zakupu, dostępności transportu i odprawy celnej. Na bieżąco informujemy Cię o każdym etapie – od zakupu, przez transport, aż po dostarczenie auta do Polski.",
        image: "/Photo/Baza wiedzy/Jak długo trwa… .webp"
    },
    {
        id: 4,
        question: "Czy pomagacie w rejestracji auta w Polsce?",
        answer: "Nie zajmujemy się bezpośrednio rejestracją pojazdu w Polsce, ale kompleksowo przygotowujemy wszystkie niezbędne dokumenty, które ułatwią Ci ten proces. Otrzymasz od nas pełen zestaw papierów wymaganych do odprawy celnej, akcyzy i rejestracji. Pomagamy w zdobyciu opinii rzeczoznawcy czy w tłumaczeniach dokumentów. W razie potrzeby służymy również pomocą i doradztwem na każdym etapie – od momentu zakupu po odbiór auta w kraju.",
        image: "/Photo/Baza wiedzy/Czy pomagacie .webp"
    },
    {
        id: 5,
        question: "Czy sprowadzane auta są uszkodzone? Czy warto je kupować?",
        answer: "Tak, większość sprowadzanych przez nas samochodów to auta powypadkowe lub lekko uszkodzone, często z niewielkimi usterkami blacharskimi lub mechanicznymi. Dzięki temu można kupić sprawdzony samochód w dużo niższej cenie niż na rynku europejskim. Przed zakupem dokładnie weryfikujemy historię pojazdu (Carfax) i analizujemy zakres uszkodzeń, abyś wiedział, w jakim stanie auto trafi do Polski. Wybieramy tylko te egzemplarze, które po sprowadzeniu do Polski stanowią atrakcyjną i bezpieczną inwestycję. W razie potrzeby pomagamy też w zorganizowaniu naprawy.",
        image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=700&fit=crop&q=80"
    }
];

export function FAQSection() {
    const [activeId, setActiveId] = useState(null);

    return (
        <section className="faq-section">
            <style>{`
                .faq-section {
                    position: relative;
                    min-height: 100vh;
                    background: #000;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 80px 20px 80px;
                    z-index: 3;
                }

                @media (min-width: 1024px) {
                    .faq-section {
                        padding: 160px 80px 100px;
                    }
                }

                /* TYTUŁ */
                .faq-title {
                    font-family: 'Monument Extended', sans-serif;
                    font-size: clamp(32px, 5vw, 82px);
                    font-weight: 400;
                    line-height: 1.2;
                    letter-spacing: 0.04em;
                    background: linear-gradient(90deg, rgba(247, 247, 247, 0.60) 0%, #FFF 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-align: center;
                    margin: 0 0 60px 0;
                    text-shadow: 0px 0px 19px rgba(0, 0, 0, 0.25);
                }

                @media (min-width: 1024px) {
                    .faq-title { margin-bottom: 100px; }
                }

                /* GRID GŁÓWNY */
                .faq-container {
                    width: 100%;
                    max-width: 1512px;
                    display: flex;
                    flex-direction: column;
                    gap: 60px;
                }

                @media (min-width: 1024px) {
                    .faq-container {
                        flex-direction: row;
                        align-items: flex-start;
                        gap: 100px;
                    }
                }

                /* LEWA KOLUMNA (LISTA) */
                .faq-list {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                }

                /* ELEMENT FAQ */
                .faq-item {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    transition: border-color 0.3s ease;
                }

                .faq-item:hover {
                    border-color: rgba(253, 151, 49, 0.3);
                }

                /* Przycisk accordion — reset wszystkich domyślnych styli button */
                .faq-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    width: 100%;
                    padding: 20px 0;
                    gap: 20px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-align: left;
                    color: inherit;
                    font: inherit;
                    min-height: 44px;
                }

                .faq-header:focus-visible {
                    outline: 2px solid #FD9731;
                    outline-offset: 4px;
                    border-radius: 4px;
                }

                .faq-question {
                    font-family: 'Inter', sans-serif;
                    font-size: clamp(18px, 1.5vw, 24px);
                    font-weight: 400;
                    line-height: 1.4;
                    margin: 0;
                    transition: color 0.4s ease;
                }

                .faq-icon {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                    position: relative;
                    margin-top: 4px; /* Wyrównanie optyczne do tekstu */
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                /* ODPOWIEDŹ */
                .faq-answer-wrap {
                    overflow: hidden;
                    transition: max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
                }

                .faq-answer {
                    color: #F5F5F5;
                    font-family: 'Inter', sans-serif;
                    font-size: clamp(14px, 1.1vw, 16px);
                    font-weight: 400;
                    line-height: 1.6;
                    margin: 0;
                    padding-bottom: 30px;
                    padding-right: 20px;
                    opacity: 0.8;
                }

                /* PRAWA KOLUMNA (ZDJĘCIA STICKY) */
                /* Ukrywamy na mobile, bo zajmuje za dużo miejsca */
                .faq-images-col {
                    display: none; 
                }

                @media (min-width: 1024px) {
                    .faq-images-col {
                        display: block;
                        position: sticky;
                        top: 100px;
                        width: 50%;
                        max-width: 730px;
                        height: 600px;
                        border-radius: 24px;
                        overflow: hidden;
                        flex-shrink: 0;
                        background: rgba(21, 32, 60, 0.3);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                    }
                }

                .faq-img-layer {
                    position: absolute;
                    inset: 0;
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .faq-img-layer img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Overlay na zdjęciu */
                .faq-img-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
                    pointer-events: none;
                }

                /* Placeholder gdy nic nie wybrano */
                .faq-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at center, rgba(253, 151, 49, 0.05) 0%, transparent 70%);
                }

            `}</style>

            {/* Title */}
            <h2 className="faq-title">
                Baza wiedzy
            </h2>

            <div className="faq-container">
                {/* Left - FAQ List */}
                <div className="faq-list">
                    {faqData.map((faq) => {
                        const isActive = activeId === faq.id;
                        const panelId = `faq-panel-${faq.id}`;
                        const headerId = `faq-header-${faq.id}`;
                        return (
                            <div
                                key={faq.id}
                                className="faq-item"
                            >
                                <button
                                    id={headerId}
                                    className="faq-header"
                                    aria-expanded={isActive}
                                    aria-controls={panelId}
                                    onClick={() => setActiveId(isActive ? null : faq.id)}
                                >
                                    <h3 className="faq-question" style={{
                                        color: isActive ? '#FD9731' : 'rgba(245, 245, 245, 0.75)',
                                        margin: 0,
                                        fontWeight: 400,
                                    }}>
                                        {faq.question}
                                    </h3>

                                    {/* Icon + */}
                                    <div className="faq-icon" aria-hidden="true" style={{
                                        transform: isActive ? 'rotate(135deg)' : 'rotate(0deg)'
                                    }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 5V19M5 12H19"
                                                stroke={isActive ? '#FD9731' : 'rgba(245, 245, 245, 0.75)'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                </button>

                                {/* Answer panel */}
                                <div
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={headerId}
                                    aria-hidden={!isActive}
                                    className="faq-answer-wrap"
                                    style={{
                                        maxHeight: isActive ? '1000px' : '0',
                                        opacity: isActive ? 1 : 0
                                    }}
                                >
                                    <p className="faq-answer">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right - Sticky Image (Desktop Only) */}
                <div className="faq-images-col">
                    {/* Default placeholder */}
                    <div className="faq-placeholder" style={{ opacity: activeId === null ? 1 : 0 }}>
                        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                            <circle cx="50" cy="50" r="40"
                                stroke="rgba(253, 151, 49, 0.3)"
                                strokeWidth="2"
                                strokeDasharray="4 4" />
                            <text x="50" y="55"
                                textAnchor="middle"
                                fill="rgba(245, 245, 245, 0.5)"
                                fontSize="12"
                                fontFamily="Inter">
                                Wybierz pytanie
                            </text>
                        </svg>
                    </div>

                    {/* Active images */}
                    {faqData.map((faq) => (
                        <div
                            key={faq.id}
                            className="faq-img-layer"
                            style={{
                                opacity: activeId === faq.id ? 1 : 0,
                                filter: activeId === faq.id ? 'grayscale(0) blur(0px)' : 'grayscale(1) blur(10px)',
                                transform: activeId === faq.id ? 'scale(1)' : 'scale(1.1)',
                            }}
                        >
                            <Image src={faq.image} alt={faq.question} fill sizes="(max-width: 1024px) 100vw, 730px" style={{ objectFit: 'cover' }} />
                            <div className="faq-img-overlay" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}