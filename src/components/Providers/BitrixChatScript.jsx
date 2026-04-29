'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import {
    COOKIE_CONSENT_ACCEPTED_EVENT,
    readMarketingConsentFromStorage,
} from '../../constants/cookieConsent';

const BITRIX_LOADER_SRC = 'https://cdn.bitrix24.pl/b33619119/crm/site_button/loader_3_ow2viz.js';

/**
 * Bitrix24 — tylko przy zgodzie marketingowej („Akceptuj wszystkie” / legacy accepted)
 * oraz po kliknięciu „Czat online”. „Tylko niezbędne” / necessary / legacy declined → brak widgetu.
 */
export function BitrixChatScript() {
    const [consentAccepted, setConsentAccepted] = useState(false);
    const [injectLoader, setInjectLoader] = useState(false);
    const [widgetSeen, setWidgetSeen] = useState(false);

    useEffect(() => {
        if (readMarketingConsentFromStorage()) {
            setConsentAccepted(true);
        }

        const onConsent = (e) => {
            if (e.detail?.marketing) setConsentAccepted(true);
        };
        window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onConsent);
        return () => window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onConsent);
    }, []);

    useEffect(() => {
        if (!injectLoader || widgetSeen) return undefined;
        if (typeof document === 'undefined') return undefined;
        if (document.querySelector('.b24-widget-button-wrapper')) {
            setWidgetSeen(true);
            return undefined;
        }
        const obs = new MutationObserver(() => {
            if (document.querySelector('.b24-widget-button-wrapper')) {
                setWidgetSeen(true);
                obs.disconnect();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        const t = window.setTimeout(() => {
            obs.disconnect();
            setWidgetSeen(true);
        }, 12000);
        return () => {
            window.clearTimeout(t);
            obs.disconnect();
        };
    }, [injectLoader, widgetSeen]);

    if (!consentAccepted) return null;

    return (
        <>
            {!widgetSeen && (
                <button
                    type="button"
                    className="bitrix-chat-launcher"
                    disabled={injectLoader}
                    onClick={() => setInjectLoader(true)}
                    aria-label={injectLoader ? 'Ładowanie czatu' : 'Otwórz czat online'}
                >
                    {injectLoader ? 'Ładowanie…' : 'Czat online'}
                </button>
            )}
            {injectLoader && (
                <Script
                    id="bitrix24-crm"
                    strategy="lazyOnload"
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,u){var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/60000|0);var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);})(window,document,'${BITRIX_LOADER_SRC}');`,
                    }}
                />
            )}
        </>
    );
}
