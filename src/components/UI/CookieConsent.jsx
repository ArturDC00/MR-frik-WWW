'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    COOKIE_CONSENT_STORAGE_KEY,
    COOKIE_CONSENT_ACCEPTED_EVENT,
    COOKIE_CONSENT_ALL,
    COOKIE_CONSENT_NECESSARY,
} from '../../constants/cookieConsent';

export function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
            if (!saved) setVisible(true);
        } catch {
            setVisible(true);
        }
    }, []);

    const accept = () => {
        try {
            localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_ALL);
        } catch {
            /* noop */
        }
        setVisible(false);
        window.dispatchEvent(
            new CustomEvent(COOKIE_CONSENT_ACCEPTED_EVENT, {
                detail: { accepted: true, marketing: true },
            }),
        );
    };

    const decline = () => {
        try {
            localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, COOKIE_CONSENT_NECESSARY);
        } catch {
            /* noop */
        }
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cc-dialog-title"
                    className="cc-dialog-root"
                    style={{
                        position: 'fixed',
                        bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10080,
                        width: 'min(640px, calc(100vw - 24px))',
                        maxHeight: 'min(78dvh, calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px))',
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain',
                        background: 'rgba(5, 8, 15, 0.95)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(253, 151, 49, 0.25)',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                    }}
                >
                    <style>{`
                        .cc-row {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }
                        .cc-text {
                            font-family: Inter, sans-serif;
                            font-size: 14px;
                            font-weight: 400;
                            line-height: 1.5;
                            color: rgba(245,245,245,0.85);
                            margin: 0;
                        }
                        .cc-link {
                            color: rgba(253,151,49,0.8);
                            text-decoration: none;
                        }
                        .cc-link:hover { color: #FD9731; text-decoration: underline; }
                        .cc-actions {
                            display: flex;
                            gap: 10px;
                            flex-wrap: wrap;
                        }
                        .cc-btn-accept {
                            flex: 1;
                            min-width: 140px;
                            min-height: 44px;
                            padding: 10px 20px;
                            border-radius: 10px;
                            background: linear-gradient(90deg, #FD9731 -2%, #CF6A05 116%);
                            border: none;
                            color: #fff;
                            font-family: Inter, sans-serif;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: filter 0.2s ease;
                        }
                        .cc-btn-accept:hover { filter: brightness(1.1); }
                        .cc-btn-decline {
                            flex: 1;
                            min-width: 120px;
                            min-height: 44px;
                            padding: 10px 20px;
                            border-radius: 10px;
                            background: transparent;
                            border: 1px solid rgba(255,255,255,0.12);
                            color: rgba(245,245,245,0.75);
                            font-family: Inter, sans-serif;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: border-color 0.2s ease, color 0.2s ease;
                        }
                        .cc-btn-decline:hover {
                            border-color: rgba(255,255,255,0.3);
                            color: rgba(245,245,245,0.8);
                        }
                    `}</style>

                    <div className="cc-row">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
                            <circle cx="10" cy="10" r="9" stroke="rgba(253,151,49,0.6)" strokeWidth="1.5"/>
                            <path d="M10 6v5M10 13.5v.5" stroke="#FD9731" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <p id="cc-dialog-title" className="cc-text">
                            Ta strona używa plików cookie w celu zapewnienia prawidłowego działania i analizy ruchu.
                            Szczegóły znajdziesz w{' '}
                            <a href="/polityka-prywatnosci" className="cc-link">Polityce Prywatności</a>.
                        </p>
                    </div>

                    <p className="cc-text" style={{ fontSize: '12px', opacity: 0.78, margin: 0 }}>
                        „Akceptuj wszystkie” obejmuje m.in. widget czatu online (Bitrix24) — skrypt ładuje się dopiero po
                        kliknięciu „Czat online”. „Tylko niezbędne” wyłącza marketing i czat.
                    </p>

                    <div className="cc-actions">
                        <button className="cc-btn-accept" onClick={accept} autoFocus>
                            Akceptuj wszystkie
                        </button>
                        <button className="cc-btn-decline" onClick={decline}>
                            Tylko niezbędne
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
