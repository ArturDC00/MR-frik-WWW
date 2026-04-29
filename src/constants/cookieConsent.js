/** Klucz localStorage — zgoda cookies */
export const COOKIE_CONSENT_STORAGE_KEY = 'mrfrik_cookie_consent';

/** Tylko niezbędne — bez marketingu / bez czatu Bitrix24 */
export const COOKIE_CONSENT_NECESSARY = 'necessary';

/** Wszystkie — w tym marketing (widget czatu Bitrix24 po dodatkowym kliknięciu) */
export const COOKIE_CONSENT_ALL = 'all';

/** @deprecated migracja ze starszej wersji */
export const COOKIE_CONSENT_LEGACY_DECLINED = 'declined';

/** @deprecated migracja ze starszej wersji (= pełna zgoda jak ALL) */
export const COOKIE_CONSENT_LEGACY_ACCEPTED = 'accepted';

/**
 * Po pełnej zgodzie — detail.marketing === true. Skrypty marketingowe (np. launcher Bitrix) mogą działać.
 */
export const COOKIE_CONSENT_ACCEPTED_EVENT = 'mrfrik:cookie-consent';

/** Czy użytkownik wyraził zgodę na wariant z marketingiem (Bitrix itd.) */
export function hasMarketingConsentValue(value) {
    if (!value || typeof value !== 'string') return false;
    return value === COOKIE_CONSENT_ALL || value === COOKIE_CONSENT_LEGACY_ACCEPTED;
}

export function readMarketingConsentFromStorage() {
    try {
        return hasMarketingConsentValue(localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
    } catch {
        return false;
    }
}
