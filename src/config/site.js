/**
 * Kanoniczny adres strony (SEO, Open Graph, JSON-LD).
 * Na serwerze ustaw w .env.local: NEXT_PUBLIC_SITE_URL=https://mrfrik.com
 */
export function getSiteUrl() {
    const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://mrfrik.com';
    return raw.replace(/\/+$/, '');
}

export const siteUrl = getSiteUrl();

/** Host bez protokołu, np. mrfrik.com — treści prawne / etykiety. */
export const siteHostname = (() => {
    try {
        return new URL(siteUrl).hostname;
    } catch {
        return 'mrfrik.com';
    }
})();
