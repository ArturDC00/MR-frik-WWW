import Link from 'next/link';
import { ScrollRestorer } from '../../components/UI/ScrollRestorer';

export const metadata = {
    title: 'Polityka Prywatności — MrFrik Import',
    description: 'Polityka prywatności serwisu MrFrik. Informacje o przetwarzaniu danych osobowych przez PF Group Sp. z o.o.',
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://mrfrik.pl/polityka-prywatnosci' },
};

export default function PolitykaPrywatnosci() {
    return (
        <main style={{
            background: '#020203',
            minHeight: '100vh',
            color: '#F5F5F5',
            fontFamily: 'Inter, sans-serif',
        }}>
            <ScrollRestorer />
            <style>{`
                .legal-wrap {
                    max-width: 860px;
                    margin: 0 auto;
                    padding: clamp(80px,10vh,120px) clamp(20px,5vw,60px) clamp(60px,8vh,100px);
                }
                .legal-back {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #FD9731;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    margin-bottom: 48px;
                    transition: opacity 0.2s ease;
                }
                .legal-back:hover { opacity: 0.75; }
                .legal-eyebrow {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    color: #FD9731;
                    margin: 0 0 16px;
                    opacity: 0.85;
                }
                .legal-h1 {
                    font-family: 'Monument Extended', sans-serif;
                    font-size: clamp(28px, 4vw, 52px);
                    font-weight: 400;
                    line-height: 1.2;
                    letter-spacing: 0.03em;
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0 0 12px;
                }
                .legal-meta {
                    font-size: 13px;
                    color: rgba(245,245,245,0.35);
                    margin: 0 0 48px;
                    letter-spacing: 0.3px;
                }
                .legal-sep {
                    height: 1px;
                    background: linear-gradient(90deg, #FD9731 0%, transparent 80%);
                    margin-bottom: 48px;
                    opacity: 0.4;
                }
                .legal-h2 {
                    font-family: Inter, sans-serif;
                    font-size: clamp(16px, 2vw, 20px);
                    font-weight: 700;
                    color: #F5F5F5;
                    margin: 40px 0 14px;
                    line-height: 1.4;
                }
                .legal-h2:first-of-type { margin-top: 0; }
                .legal-p {
                    font-size: clamp(14px, 1.3vw, 16px);
                    line-height: 1.8;
                    color: rgba(245,245,245,0.65);
                    margin: 0 0 14px;
                }
                .legal-p a {
                    color: #FD9731;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .legal-ul {
                    font-size: clamp(14px, 1.3vw, 16px);
                    line-height: 1.8;
                    color: rgba(245,245,245,0.65);
                    padding-left: 24px;
                    margin: 0 0 14px;
                }
                .legal-ul li { margin-bottom: 6px; }
                .legal-box {
                    border: 1px solid rgba(253,151,49,0.2);
                    background: rgba(253,151,49,0.04);
                    border-radius: 12px;
                    padding: 20px 24px;
                    margin: 24px 0;
                }
                .legal-box .legal-p { margin: 0; }
            `}</style>

            <div className="legal-wrap">
                <Link href="/" className="legal-back">
                    ← Wróć do strony głównej
                </Link>

                <p className="legal-eyebrow">Dokument prawny</p>
                <h1 className="legal-h1">Polityka Prywatności</h1>
                <p className="legal-meta">Ostatnia aktualizacja: 1 marca 2026 r.</p>
                <div className="legal-sep" />

                <div className="legal-box">
                    <p className="legal-p">
                        <strong style={{color: '#F5F5F5'}}>Administrator danych:</strong> PF Group Sp. z o.o.,
                        ul. Bocianiej 29, 55-300 Środa Śląska, NIP: 8982248331,
                        e-mail: <a href="mailto:kontakt@mrfrik.pl">kontakt@mrfrik.pl</a>
                    </p>
                </div>

                <h2 className="legal-h2">§ 1. Informacje ogólne</h2>
                <p className="legal-p">
                    Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych
                    użytkowników serwisu internetowego <strong style={{color:'#F5F5F5'}}>mrfrik.pl</strong> prowadzonego przez PF Group Sp. z o.o.
                    z siedzibą w Środzie Śląskiej (dalej: „Administrator" lub „Spółka").
                </p>
                <p className="legal-p">
                    Administrator dokłada szczególnych starań w celu ochrony prywatności osób odwiedzających serwis
                    i przetwarza dane osobowe zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679
                    z dnia 27 kwietnia 2016 r. (RODO) oraz polską ustawą o ochronie danych osobowych.
                </p>

                <h2 className="legal-h2">§ 2. Zbierane dane osobowe</h2>
                <p className="legal-p">Administrator może przetwarzać następujące kategorie danych osobowych:</p>
                <ul className="legal-ul">
                    <li>Imię i nazwisko lub imię</li>
                    <li>Numer telefonu</li>
                    <li>Adres e-mail (jeśli podany)</li>
                    <li>Informacje o zainteresowaniu konkretnym modelem pojazdu oraz budżetem</li>
                    <li>Dane techniczne: adres IP, typ urządzenia, przeglądarka, czas odwiedzin (w ramach plików cookie)</li>
                </ul>

                <h2 className="legal-h2">§ 3. Cel i podstawa przetwarzania</h2>
                <p className="legal-p">Dane osobowe przetwarzane są w następujących celach:</p>
                <ul className="legal-ul">
                    <li><strong style={{color:'#F5F5F5'}}>Obsługa zapytania ofertowego</strong> — art. 6 ust. 1 lit. b RODO (niezbędność do zawarcia umowy)</li>
                    <li><strong style={{color:'#F5F5F5'}}>Marketing bezpośredni</strong> — art. 6 ust. 1 lit. f RODO (uzasadniony interes administratora) lub zgoda (art. 6 ust. 1 lit. a RODO)</li>
                    <li><strong style={{color:'#F5F5F5'}}>Analityka serwisu</strong> — art. 6 ust. 1 lit. f RODO (uzasadniony interes polegający na ulepszaniu usług)</li>
                    <li><strong style={{color:'#F5F5F5'}}>Wypełnienie obowiązków prawnych</strong> — art. 6 ust. 1 lit. c RODO</li>
                </ul>

                <h2 className="legal-h2">§ 4. Okres przechowywania danych</h2>
                <p className="legal-p">
                    Dane osobowe przechowywane są przez okres niezbędny do realizacji celów, dla których zostały
                    zebrane, jednak nie dłużej niż:
                </p>
                <ul className="legal-ul">
                    <li>przez czas trwania relacji handlowej i 3 lata po jej zakończeniu (dane klientów)</li>
                    <li>przez czas wymagany przepisami prawa (dane księgowe — 5 lat)</li>
                    <li>do cofnięcia zgody (dane przetwarzane na podstawie zgody)</li>
                </ul>

                <h2 className="legal-h2">§ 5. Odbiorcy danych</h2>
                <p className="legal-p">
                    Dane osobowe mogą być przekazywane podmiotom współpracującym ze Spółką wyłącznie w zakresie
                    niezbędnym do realizacji usług, tj.:
                </p>
                <ul className="legal-ul">
                    <li>dostawcom usług IT (hosting, analityka)</li>
                    <li>partnerom logistycznym i celnym</li>
                    <li>doradcom prawnym i księgowym (pod warunkiem zachowania poufności)</li>
                </ul>
                <p className="legal-p">
                    Administrator nie sprzedaje danych osobowych osobom trzecim ani nie przekazuje ich poza
                    Europejski Obszar Gospodarczy bez zapewnienia odpowiednich zabezpieczeń.
                </p>

                <h2 className="legal-h2">§ 6. Prawa osób, których dane dotyczą</h2>
                <p className="legal-p">Użytkownikowi przysługują następujące prawa:</p>
                <ul className="legal-ul">
                    <li>prawo dostępu do danych (art. 15 RODO)</li>
                    <li>prawo do sprostowania danych (art. 16 RODO)</li>
                    <li>prawo do usunięcia danych („prawo do bycia zapomnianym") — art. 17 RODO</li>
                    <li>prawo do ograniczenia przetwarzania (art. 18 RODO)</li>
                    <li>prawo do przenoszenia danych (art. 20 RODO)</li>
                    <li>prawo do sprzeciwu (art. 21 RODO)</li>
                    <li>prawo do cofnięcia zgody w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania dokonanego przed cofnięciem zgody</li>
                    <li>prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych</li>
                </ul>
                <p className="legal-p">
                    W celu realizacji powyższych praw prosimy o kontakt na adres:{' '}
                    <a href="mailto:kontakt@mrfrik.pl">kontakt@mrfrik.pl</a>
                </p>

                <h2 className="legal-h2">§ 7. Pliki cookie</h2>
                <p className="legal-p">
                    Serwis korzysta z plików cookie — małych plików tekstowych przechowywanych na urządzeniu
                    użytkownika. Pliki cookie służą do:
                </p>
                <ul className="legal-ul">
                    <li>zapewnienia prawidłowego działania serwisu (cookie niezbędne)</li>
                    <li>analizy ruchu i zachowania użytkowników (cookie analityczne — za zgodą)</li>
                    <li>personalizacji treści marketingowych (cookie marketingowe — za zgodą)</li>
                </ul>
                <p className="legal-p">
                    Użytkownik może zmienić ustawienia plików cookie w ustawieniach przeglądarki
                    lub za pomocą banera cookie wyświetlanego przy pierwszej wizycie.
                </p>

                <h2 className="legal-h2">§ 8. Bezpieczeństwo danych</h2>
                <p className="legal-p">
                    Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające ochronę
                    przetwarzanych danych osobowych przed nieuprawnionym dostępem, zmianą, ujawnieniem lub
                    zniszczeniem, w tym szyfrowanie połączeń (SSL/TLS).
                </p>

                <h2 className="legal-h2">§ 9. Zmiany Polityki Prywatności</h2>
                <p className="legal-p">
                    Administrator zastrzega sobie prawo do zmiany niniejszej Polityki Prywatności.
                    Wszelkie zmiany będą publikowane na niniejszej stronie ze wskazaniem daty
                    ostatniej aktualizacji. W przypadku istotnych zmian użytkownicy zostaną poinformowani
                    za pośrednictwem serwisu.
                </p>

                <h2 className="legal-h2">§ 10. Kontakt</h2>
                <p className="legal-p">
                    W sprawach dotyczących ochrony danych osobowych prosimy o kontakt:<br />
                    <strong style={{color:'#F5F5F5'}}>PF Group Sp. z o.o.</strong><br />
                    ul. Bocianiej 29, 55-300 Środa Śląska<br />
                    NIP: 8982248331<br />
                    E-mail: <a href="mailto:kontakt@mrfrik.pl">kontakt@mrfrik.pl</a>
                </p>
            </div>
        </main>
    );
}
