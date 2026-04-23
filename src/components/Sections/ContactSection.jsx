'use client';
// ============================================================
// CONTACT SECTION — Apple Design 2026
// 2-kolumnowy layout: lewa = hero, prawa = formularz
// Lead: POST /api/lead → Bitrix crm.lead.add (BITRIX24_WEBHOOK_BASE w .env.local).
// Skrypt czatu w layout.jsx to osobny widget (site_button).
// ============================================================
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useImportCountTarget } from '../Providers/ImportCountProvider';

// ── MULTI-STEP LEAD FORM ──────────────────────────────────
const BUDGET_OPTIONS = [
    { label: 'do 50 000 zł', value: 'do 50 000 zł' },
    { label: '50 000–100 000 zł', value: '50 000–100 000 zł' },
    { label: '100 000–200 000 zł', value: '100 000–200 000 zł' },
    { label: 'powyżej 200 000 zł', value: 'powyżej 200 000 zł' },
];

const CAR_TYPES = [
    { label: '🚙 SUV / Pick-up', value: 'SUV/Pick-up' },
    { label: '🚗 Sedan / Lux', value: 'Sedan/Lux' },
    { label: '🏎️ Muscle / Sport', value: 'Muscle/Sport' },
    { label: '⚡ Elektryczny', value: 'Elektryczny' },
    { label: '🚐 Inny', value: 'Inny' },
    { label: '🤔 Jeszcze nie wiem', value: 'Jeszcze nie wiem' },
];

function LeadForm() {
    const [step, setStep] = useState(1);
    const [model, setModel] = useState('');
    const [carType, setCarType] = useState('');
    const [budget, setBudget] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [rodo, setRodo] = useState(false);
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async () => {
        setSubmitError('');
        setSubmitting(true);
        try {
            const res = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    carType,
                    model: model.trim(),
                    budget,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error || 'Nie udało się wysłać zapytania.');
            }
            setSent(true);
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'Błąd sieci.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSent(false);
        setStep(1);
        setModel('');
        setCarType('');
        setBudget('');
        setName('');
        setPhone('');
        setEmail('');
        setRodo(false);
        setSubmitError('');
    };

    return (
        <div className="lf-wrap">
            {/* Progress bar */}
            <div className="lf-progress" aria-hidden="true">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`lf-step-dot${step >= s ? ' active' : ''}${step > s ? ' done' : ''}`} />
                ))}
            </div>

            {sent ? (
                <div className="lf-sent">
                    <span className="lf-sent-icon">✅</span>
                    <p className="lf-sent-title">Gotowe!</p>
                    <p className="lf-sent-sub">Zapisaliśmy Twoje zapytanie w systemie.<br />Skontaktujemy się tak szybko, jak to możliwe.</p>
                    <button className="lf-btn lf-btn-primary" onClick={resetForm}>
                        Wyślij kolejne zapytanie
                    </button>
                </div>
            ) : step === 1 ? (
                <div className="lf-body">
                    <p className="lf-step-label">Krok 1 z 3</p>
                    <h3 className="lf-title">Jaki samochód Cię interesuje?</h3>
                    <input
                        className="lf-input"
                        type="text"
                        placeholder="np. Ford Mustang GT 2022 (opcjonalnie)"
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        maxLength={80}
                    />
                    <div className="lf-type-grid">
                        {CAR_TYPES.map(ct => (
                            <button
                                key={ct.value}
                                className={`lf-type-btn${carType === ct.value ? ' selected' : ''}`}
                                onClick={() => setCarType(ct.value)}
                                type="button"
                            >
                                {ct.label}
                            </button>
                        ))}
                    </div>
                    <button
                        className="lf-btn lf-btn-primary"
                        disabled={!carType}
                        onClick={() => setStep(2)}
                    >
                        Dalej →
                    </button>
                </div>
            ) : step === 2 ? (
                <div className="lf-body">
                    <p className="lf-step-label">Krok 2 z 3</p>
                    <h3 className="lf-title">Twój budżet</h3>
                    <div className="lf-budget-grid">
                        {BUDGET_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                className={`lf-budget-btn${budget === opt.value ? ' selected' : ''}`}
                                onClick={() => setBudget(opt.value)}
                                type="button"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="lf-row">
                        <button className="lf-btn lf-btn-ghost" onClick={() => setStep(1)}>← Wróć</button>
                        <button className="lf-btn lf-btn-primary" disabled={!budget} onClick={() => setStep(3)}>Dalej →</button>
                    </div>
                </div>
            ) : (
                <div className="lf-body">
                    <p className="lf-step-label">Krok 3 z 3</p>
                    <h3 className="lf-title">Jak się z Tobą skontaktować?</h3>
                    <input
                        className="lf-input"
                        type="text"
                        placeholder="Twoje imię"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={50}
                    />
                    <input
                        className="lf-input"
                        type="tel"
                        placeholder="Numer telefonu"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        maxLength={20}
                    />
                    <input
                        className="lf-input"
                        type="email"
                        placeholder="Adres e-mail"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        maxLength={100}
                    />
                    <label className="lf-rodo">
                        <input type="checkbox" checked={rodo} onChange={e => setRodo(e.target.checked)} />
                        <span>Wyrażam zgodę na przetwarzanie moich danych osobowych przez PF Group Sp. z o.o. w celu obsługi zapytania. <a href="/polityka-prywatnosci" className="lf-rodo-link">Polityka prywatności</a>.</span>
                    </label>
                    {submitError ? (
                        <p className="lf-api-error" role="alert">{submitError}</p>
                    ) : null}
                    <div className="lf-row">
                        <button type="button" className="lf-btn lf-btn-ghost" disabled={submitting} onClick={() => setStep(2)}>← Wróć</button>
                        <button
                            type="button"
                            className="lf-btn lf-btn-email"
                            disabled={!name.trim() || !phone.trim() || !email.trim() || !rodo || submitting}
                            onClick={() => void handleSubmit()}
                        >
                            {submitting ? (
                                'Wysyłanie…'
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    Wyślij zapytanie
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ContactSection() {
    const { targetCount, ready } = useImportCountTarget();
    const importCarsLabel = ready ? targetCount : 2200;

    const socials = [
        {
            label: 'Facebook',
            href: 'https://facebook.com/mrfrik.import/',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
            color: '#1877F2',
        },
        {
            label: 'YouTube',
            href: 'https://youtube.com/@MrFrikImportSamochodow/shorts',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
            ),
            color: '#FF0000',
        },
        {
            label: 'Instagram',
            href: 'https://instagram.com/mrfrik.import/',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
            ),
            color: '#E1306C',
        },
    ];

    return (
        <section id="section-contact" className="cs-section">

            {/* ══════════════════════════════════════════════
                AMBIENT LIGHT — subtelny gradient w tle
            ══════════════════════════════════════════════ */}
            <div className="cs-ambient" aria-hidden="true" />

            {/* ══════════════════════════════════════════════
                1. HERO 2-KOLUMNOWY — lewa: tekst, prawa: formularz
            ══════════════════════════════════════════════ */}
            <div className="cs-hero">
                <div className="cs-hero-content">
                    <p className="cs-eyebrow">KONTAKT</p>
                    <h2 className="cs-heading">
                        TWOJE MARZENIE<br />W ZASIĘGU RĘKI
                    </h2>
                    <p className="cs-subtext">
                        Powiedz nam, jakiego samochodu szukasz. Wypełnij krótki formularz, a pomożemy znaleźć i sprowadzić auto z USA lub Kanady dopasowane do Twojego budżetu.
                    </p>

                    {/* Trust badges */}
                    <div className="cs-trust-badges">
                        <div className="cs-badge">
                            <span className="cs-badge-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                    <polyline points="9 12 11 14 15 10"/>
                                </svg>
                            </span>
                            <span>Bezpłatna konsultacja</span>
                        </div>
                        <div className="cs-badge">
                            <span className="cs-badge-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                                </svg>
                            </span>
                            <span>Ponad {importCarsLabel} aut sprowadzonych</span>
                        </div>
                        <div className="cs-badge">
                            <span className="cs-badge-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                                </svg>
                            </span>
                            <span>8 lat doświadczenia</span>
                        </div>
                    </div>
                </div>

                {/* Formularz po prawej */}
                <div className="cs-hero-form">
                    <LeadForm />
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                2. SOCIAL PILL BUTTONS
            ══════════════════════════════════════════════ */}
            <div className="cs-socials">
                {socials.map(s => (
                    <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cs-pill"
                        style={{ '--pill-color': s.color }}
                    >
                        <span className="cs-pill-icon">{s.icon}</span>
                        <span className="cs-pill-label">{s.label}</span>
                    </a>
                ))}
            </div>

            {/* ── separator ── */}
            <div className="cs-sep" />

            {/* ══════════════════════════════════════════════
                3. DOLNA SEKCJA — Logo + CTA kalkulator
            ══════════════════════════════════════════════ */}
            <div className="cs-bottom">
                <div className="cs-logo-wrap">
                    <Image
                        src="/models/MrFrik_reBranding_logo_2025-13.png"
                        alt="MrFrik — Import Samochodów z USA i Kanady do Polski"
                        className="cs-logo"
                        width={3508}
                        height={2481}
                        sizes="(max-width: 640px) 55vw, 30vw"
                        draggable={false}
                        quality={90}
                    />
                </div>

                {/* Kalkulator CTA — subtelna tafla szklana */}
                <div className="cs-calc-tile">
                    <div className="cs-calc-body">
                        <span className="cs-calc-title">Kalkulator kosztów importu</span>
                        <span className="cs-calc-desc">
                            Odwiedź naszą platformę i sprawdź kalkulator, dostępny również dla gości.<br /><br />
                            Oblicz, ile może kosztować sprowadzenie Twojego samochodu z USA lub Kanady.
                        </span>
                    </div>
                    <a href="https://app.mrfrik.pl" target="_blank" rel="noopener noreferrer" className="cs-calc-btn" id="cs-cta-btn">Oblicz</a>
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                4. STOPKA
            ══════════════════════════════════════════════ */}
            <div className="cs-footer">
                <div className="cs-footer-links">
                    <Link href="/polityka-prywatnosci" className="cs-footer-link">Polityka Prywatności</Link>
                    <Link href="/regulamin" className="cs-footer-link">Regulamin</Link>
                </div>
                <span className="cs-copy">© 2026 by Dimensione Creativa. All rights reserved.</span>
            </div>

            {/* ══════════════════════════════════════════════
                STYLE — Apple Design 2026
            ══════════════════════════════════════════════ */}
            <style>{`
                @keyframes cs-pill-glow {
                    from { box-shadow: 0 0 0 0 color-mix(in srgb, var(--pill-color) 40%, transparent); }
                    to   { box-shadow: 0 0 20px 4px color-mix(in srgb, var(--pill-color) 0%, transparent); }
                }

                /* ── SEKCJA ── */
                .cs-section {
                    width: 100%;
                    min-height: auto;
                    background: radial-gradient(ellipse 120% 80% at 50% 100%, #111827 0%, #0a0a0f 60%, #020203 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    position: relative;
                    overflow: hidden;
                    padding: clamp(48px, 6vh, 96px) clamp(20px, 5vw, 80px) clamp(32px, 5vh, 72px);
                    box-sizing: border-box;
                    gap: clamp(32px, 4vh, 56px);
                }

                /* ── AMBIENT LIGHT ── */
                .cs-ambient {
                    position: absolute;
                    top: -20%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    height: 600px;
                    background: radial-gradient(ellipse at center, rgba(33,89,214,0.18) 0%, rgba(253,151,49,0.08) 50%, transparent 70%);
                    pointer-events: none;
                    z-index: 0;
                }

                /* ── HERO 2-COLUMN ── */
                .cs-hero {
                    width: 100%;
                    max-width: 1440px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: clamp(40px, 6vw, 100px);
                    position: relative;
                    z-index: 1;
                    flex-wrap: wrap;
                }

                .cs-hero-content {
                    flex: 1 1 320px;
                    max-width: 560px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 24px;
                    padding-top: 8px;
                }

                .cs-hero-form {
                    flex: 1 1 360px;
                    max-width: 600px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: flex-end;
                    width: 100%;
                }

                .cs-eyebrow {
                    font-family: Inter, sans-serif;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 3px;
                    color: #FD9731;
                    text-transform: uppercase;
                    margin: 0;
                    opacity: 0.9;
                }

                .cs-heading {
                    font-family: "Monument Extended", sans-serif;
                    font-size: clamp(32px, 4.5vw, 72px);
                    font-weight: 400;
                    line-height: 1.15;
                    letter-spacing: 0.02em;
                    background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                    text-transform: uppercase;
                }

                .cs-subtext {
                    font-family: Inter, sans-serif;
                    font-size: clamp(15px, 1.4vw, 18px);
                    font-weight: 400;
                    line-height: 1.7;
                    color: rgba(245,245,245,0.65);
                    margin: 0;
                    max-width: 480px;
                }

                /* ── TRUST BADGES ── */
                .cs-trust-badges {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 8px;
                }

                .cs-badge {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-family: Inter, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: rgba(245,245,245,0.72);
                }

                .cs-badge-icon {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                    color: #FD9731;
                }

                /* ── SOCIAL PILLS ── */
                .cs-socials {
                    width: 100%;
                    max-width: 1440px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    justify-content: center;
                    position: relative;
                    z-index: 1;
                }

                .cs-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 24px;
                    border-radius: 100px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    color: #F5F5F5;
                    font-family: Inter, sans-serif;
                    font-size: 15px;
                    font-weight: 500;
                    text-decoration: none;
                    white-space: nowrap;
                    transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
                    cursor: pointer;
                }
                .cs-pill:hover {
                    background: color-mix(in srgb, var(--pill-color) 15%, rgba(255,255,255,0.05));
                    border-color: color-mix(in srgb, var(--pill-color) 60%, transparent);
                    color: #fff;
                    transform: translateY(-3px) scale(1.04);
                    box-shadow: 0 8px 24px color-mix(in srgb, var(--pill-color) 25%, transparent);
                }
                .cs-pill-icon {
                    display: flex;
                    align-items: center;
                    color: var(--pill-color);
                    flex-shrink: 0;
                }
                .cs-pill-label {
                    letter-spacing: 0.3px;
                }

                /* ── SEPARATOR ── */
                .cs-sep {
                    width: 100%;
                    max-width: 1440px;
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, rgba(253,151,49,0.4) 30%, rgba(253,151,49,0.4) 70%, transparent 100%);
                    flex-shrink: 0;
                    position: relative;
                    z-index: 1;
                }

                /* ── DOLNA SEKCJA ── */
                .cs-bottom {
                    width: 100%;
                    max-width: 1440px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: clamp(32px, 5vw, 80px);
                    flex-wrap: wrap;
                    position: relative;
                    z-index: 1;
                }

                .cs-logo-wrap {
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                }

                .cs-logo {
                    width: clamp(220px, 30vw, 520px);
                    height: auto;
                    max-height: 220px;
                    object-fit: contain;
                    display: block;
                    user-select: none;
                    opacity: 0.92;
                }

                /* ── KALKULATOR CTA TILE ── */
                .cs-calc-tile {
                    flex: 1;
                    min-width: 280px;
                    max-width: 640px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    padding: clamp(24px,3vh,36px) clamp(24px,3vw,40px);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    box-sizing: border-box;
                }

                .cs-calc-body {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }

                .cs-calc-title {
                    font-family: Inter, sans-serif;
                    font-size: clamp(16px, 1.6vw, 22px);
                    font-weight: 600;
                    color: #F5F5F5;
                    line-height: 1.3;
                }

                .cs-calc-desc {
                    font-family: Inter, sans-serif;
                    font-size: clamp(13px, 1.1vw, 15px);
                    font-weight: 400;
                    color: rgba(245,245,245,0.55);
                    line-height: 1.6;
                }

                .cs-calc-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 24px;
                    border-radius: 100px;
                    background: linear-gradient(135deg, #FD9731 0%, #CF6A05 100%);
                    color: #fff;
                    font-family: Inter, sans-serif;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    white-space: nowrap;
                    flex-shrink: 0;
                    box-shadow: 0 4px 16px rgba(253,151,49,0.3);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .cs-calc-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(253,151,49,0.45);
                }

                /* ── STOPKA ── */
                .cs-footer {
                    width: 100%;
                    max-width: 1440px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.07);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                    box-sizing: border-box;
                    position: relative;
                    z-index: 1;
                }

                .cs-footer-links {
                    display: flex;
                    gap: clamp(16px, 2vw, 32px);
                }

                .cs-footer-link {
                    color: rgba(245,245,245,0.35);
                    font-family: Inter, sans-serif;
                    font-size: 11px;
                    text-decoration: none;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    transition: color 0.2s ease;
                }
                .cs-footer-link:hover { color: #FD9731; }

                .cs-copy {
                    color: rgba(245,245,245,0.25);
                    font-family: Inter, sans-serif;
                    font-size: 11px;
                    letter-spacing: 0.3px;
                }

                /* ── LEAD FORM ── */
                .lf-wrap {
                    width: 100%;
                    border-radius: 24px;
                    border: 1px solid rgba(255,255,255,0.10);
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    padding: clamp(28px,4vh,48px) clamp(24px,4vw,48px);
                    box-sizing: border-box;
                    position: relative;
                    z-index: 1;
                }
                .lf-progress {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                }
                .lf-step-dot {
                    flex: 1;
                    height: 3px;
                    border-radius: 2px;
                    background: rgba(255,255,255,0.12);
                    transition: background 0.3s ease;
                }
                .lf-step-dot.active { background: rgba(253,151,49,0.6); }
                .lf-step-dot.done { background: #FD9731; }

                .lf-body { display: flex; flex-direction: column; gap: 16px; }
                .lf-step-label {
                    font-family: Inter, sans-serif;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: #FD9731;
                    margin: 0;
                    opacity: 0.8;
                }
                .lf-title {
                    font-family: Inter, sans-serif;
                    font-size: clamp(18px, 2vw, 24px);
                    font-weight: 700;
                    color: #F5F5F5;
                    margin: 0 0 4px;
                    line-height: 1.3;
                }
                .lf-input {
                    width: 100%;
                    padding: 14px 18px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.05);
                    color: #F5F5F5;
                    font-family: Inter, sans-serif;
                    font-size: 15px;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color 0.2s ease, background 0.2s ease;
                }
                .lf-input::placeholder { color: rgba(245,245,245,0.3); }
                .lf-input:focus {
                    border-color: rgba(253,151,49,0.5);
                    background: rgba(253,151,49,0.04);
                }
                .lf-type-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .lf-type-btn {
                    padding: 9px 16px;
                    border-radius: 100px;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.04);
                    color: rgba(245,245,245,0.7);
                    font-family: Inter, sans-serif;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }
                .lf-type-btn:hover { border-color: rgba(253,151,49,0.4); color: #F5F5F5; }
                .lf-type-btn.selected {
                    border-color: #FD9731;
                    background: rgba(253,151,49,0.12);
                    color: #FD9731;
                }
                .lf-budget-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                .lf-budget-btn {
                    padding: 14px 12px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(255,255,255,0.04);
                    color: rgba(245,245,245,0.7);
                    font-family: Inter, sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                }
                .lf-budget-btn:hover { border-color: rgba(253,151,49,0.4); color: #F5F5F5; }
                .lf-budget-btn.selected {
                    border-color: #FD9731;
                    background: rgba(253,151,49,0.12);
                    color: #FD9731;
                    font-weight: 600;
                }
                .lf-rodo {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    color: rgba(245,245,245,0.45);
                    font-family: Inter, sans-serif;
                    font-size: 12px;
                    line-height: 1.5;
                    cursor: pointer;
                }
                .lf-rodo input[type="checkbox"] {
                    margin-top: 2px;
                    flex-shrink: 0;
                    accent-color: #FD9731;
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                }
                .lf-rodo-link {
                    color: #FD9731;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                .lf-row {
                    display: flex;
                    gap: 10px;
                    margin-top: 4px;
                }
                .lf-btn {
                    flex: 1;
                    padding: 14px 20px;
                    border-radius: 100px;
                    font-family: Inter, sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .lf-btn:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                    transform: none !important;
                }
                .lf-btn-primary {
                    background: linear-gradient(135deg, #FD9731 0%, #CF6A05 100%);
                    color: #fff;
                    box-shadow: 0 4px 16px rgba(253,151,49,0.3);
                }
                .lf-btn-primary:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(253,151,49,0.45);
                }
                .lf-btn-ghost {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: rgba(245,245,245,0.6);
                    flex: 0 0 auto;
                    padding: 14px 20px;
                }
                .lf-btn-ghost:hover {
                    background: rgba(255,255,255,0.10);
                    color: #F5F5F5;
                }
                .lf-btn-email {
                    background: linear-gradient(135deg, #FD9731 0%, #CF6A05 100%);
                    color: #fff;
                    box-shadow: 0 4px 16px rgba(253,151,49,0.3);
                }
                .lf-btn-email:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(253,151,49,0.45);
                }
                .lf-api-error {
                    font-family: Inter, sans-serif;
                    font-size: 13px;
                    line-height: 1.5;
                    color: #ffb4a8;
                    margin: 8px 0 0;
                    padding: 10px 14px;
                    border-radius: 10px;
                    background: rgba(180, 40, 40, 0.2);
                    border: 1px solid rgba(255, 120, 100, 0.25);
                }
                /* Sent state */
                .lf-sent {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 12px;
                    padding: 20px 0;
                }
                .lf-sent-icon { font-size: 48px; line-height: 1; }
                .lf-sent-title {
                    font-family: Inter, sans-serif;
                    font-size: 22px;
                    font-weight: 700;
                    color: #F5F5F5;
                    margin: 0;
                }
                .lf-sent-sub {
                    font-family: Inter, sans-serif;
                    font-size: 14px;
                    line-height: 1.6;
                    color: rgba(245,245,245,0.55);
                    margin: 0 0 8px;
                }

                /* ══════════ TABLET 768–1199px ══════════ */
                @media (max-width: 1199px) {
                    .cs-hero { flex-wrap: wrap; }
                    .cs-hero-content { max-width: 100%; flex: 1 1 100%; }
                    .cs-hero-form { max-width: 100%; flex: 1 1 100%; justify-content: flex-start; }
                }

                /* ══════════ MOBILE <640px ══════════ */
                @media (max-width: 639px) {
                    .cs-hero {
                        flex-direction: column;
                        gap: 32px;
                    }
                    .cs-socials { justify-content: flex-start; gap: 10px; }
                    .cs-pill { padding: 10px 18px; font-size: 14px; }
                    .cs-bottom { flex-direction: column; align-items: center; gap: 24px; }
                    .cs-logo-wrap { justify-content: center; }
                    .cs-logo { width: clamp(160px, 55vw, 300px); }
                    .cs-calc-tile {
                        width: 100%;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    .cs-calc-btn { width: 100%; justify-content: center; }
                    .cs-footer { flex-direction: column; align-items: flex-start; gap: 8px; }
                }
            `}</style>
        </section>
    );
}
