/** Zgodne z localStorage — historia „accepted” / „declined” */
export const COOKIE_CONSENT_STORAGE_KEY = 'mrfrik_cookie_consent';

/**
 * Po „Akceptuj wszystkie” — Bitrix24 i inne skrypty marketingowe mogą nasłuchiwać.
 * detail: { accepted: true }
 */
export const COOKIE_CONSENT_ACCEPTED_EVENT = 'mrfrik:cookie-consent';
