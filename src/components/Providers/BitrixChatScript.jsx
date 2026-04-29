'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import {
    COOKIE_CONSENT_STORAGE_KEY,
    COOKIE_CONSENT_ACCEPTED_EVENT,
} from '../../constants/cookieConsent';

const BITRIX_LOADER_SRC = 'https://cdn.bitrix24.pl/b33619119/crm/site_button/loader_3_ow2viz.js';

/**
 * Widget Bitrix24 — tylko po zgodzie „Akceptuj wszystkie” (marketing / czat).
 * Nie ładuje się przy „Tylko niezbędne”.
 */
export function BitrixChatScript() {
    const [consentAccepted, setConsentAccepted] = useState(false);

    useEffect(() => {
        try {
            if (localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === 'accepted') {
                setConsentAccepted(true);
            }
        } catch {
            /* noop */
        }

        const onConsent = (e) => {
            if (e.detail?.accepted) setConsentAccepted(true);
        };
        window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onConsent);
        return () => window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onConsent);
    }, []);

    if (!consentAccepted) return null;

    return (
        <Script
            id="bitrix24-crm"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
                __html: `(function(w,d,u){var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/60000|0);var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);})(window,document,'${BITRIX_LOADER_SRC}');`,
            }}
        />
    );
}
