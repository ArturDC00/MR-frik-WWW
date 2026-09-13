import App from '../App';

/**
 * App jest Client Componentem ('use client' na górze src/App.jsx), więc Server Component
 * może go zaimportować bezpośrednio.
 *
 * Wcześniej szło to przez ClientApp z `dynamic(..., { ssr: false })`, co powodowało
 * BAILOUT_TO_CLIENT_SIDE_RENDERING: prerenderowany <body> był pusty, a Next nie emitował
 * preloadów dla chunków App — grupa 659 KiB raw / 198 KiB gz szła dopiero PO pobraniu,
 * sparsowaniu i zhydratowaniu initial JS, czyli jeden dodatkowy RTT przed pierwszym pikselem.
 *
 * Świadomie NIE używamy tu `dynamic(..., { ssr: true })` — bezpośredni import jest tym,
 * co sprawia, że Next wstawia <script> dla chunku do HTML-a.
 */
export default function Page() {
    return <App />;
}
