import Link from 'next/link';
import { ScrollRestorer } from '../../components/UI/ScrollRestorer';
import { siteUrl, siteHostname } from '../../config/site';

export const metadata = {
    title: 'Regulamin — MrFrik Import',
    description: 'Regulamin świadczenia usług importu samochodów z USA i Kanady przez PF Group Sp. z o.o. (MrFrik).',
    robots: { index: true, follow: true },
    alternates: { canonical: `${siteUrl}/regulamin` },
};

export default function Regulamin() {
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
                <h1 className="legal-h1">Regulamin</h1>
                <p className="legal-meta">Ostatnia aktualizacja: 1 marca 2026 r.</p>
                <div className="legal-sep" />

                <div className="legal-box">
                    <p className="legal-p">
                        <strong style={{color: '#F5F5F5'}}>Usługodawca:</strong> PF Group Sp. z o.o.,
                        ul. Bocianiej 29, 55-300 Środa Śląska, NIP: 8982248331, KRS: wpis w toku,
                        e-mail: <a href="mailto:kontakt@mrfrik.pl">kontakt@mrfrik.pl</a>
                    </p>
                </div>

                <h2 className="legal-h2">§ 1. Postanowienia ogólne</h2>
                <p className="legal-p">
                    Niniejszy Regulamin określa zasady świadczenia usług importu pojazdów z USA i Kanady do Polski
                    przez PF Group Sp. z o.o. z siedzibą w Środzie Śląskiej, działającą pod marką handlową{' '}
                    <strong style={{color:'#F5F5F5'}}>MrFrik</strong> (dalej: „Spółka" lub „Usługodawca").
                </p>
                <p className="legal-p">
                    Korzystanie z usług Spółki jest równoznaczne z akceptacją niniejszego Regulaminu.
                    Regulamin jest dostępny na stronie {siteHostname}/regulamin.
                </p>

                <h2 className="legal-h2">§ 2. Definicje</h2>
                <ul className="legal-ul">
                    <li><strong style={{color:'#F5F5F5'}}>Usługodawca</strong> — PF Group Sp. z o.o., właściciel marki MrFrik</li>
                    <li><strong style={{color:'#F5F5F5'}}>Klient</strong> — osoba fizyczna lub prawna korzystająca z usług Spółki</li>
                    <li><strong style={{color:'#F5F5F5'}}>Usługa</strong> — kompleksowa obsługa importu pojazdu z USA lub Kanady do Polski</li>
                    <li><strong style={{color:'#F5F5F5'}}>Pojazd</strong> — samochód osobowy, SUV, pickup lub inny pojazd silnikowy będący przedmiotem importu</li>
                    <li><strong style={{color:'#F5F5F5'}}>Aukcja</strong> — platforma sprzedaży pojazdów (Copart, IAAI, Impact Auto lub dealerska)</li>
                    <li><strong style={{color:'#F5F5F5'}}>Serwis</strong> — strona internetowa {siteHostname} wraz z platformą online</li>
                </ul>

                <h2 className="legal-h2">§ 3. Zakres usług</h2>
                <p className="legal-p">Spółka świadczy kompleksowe usługi importu pojazdów obejmujące:</p>
                <ul className="legal-ul">
                    <li>doradztwo w wyborze pojazdu i analizę ofert z aukcji w USA i Kanadzie</li>
                    <li>weryfikację historii pojazdu (Carfax, AutoCheck) i ocenę zakresu uszkodzeń</li>
                    <li>reprezentację Klienta podczas licytacji (w zakresie uzgodnionym z Klientem)</li>
                    <li>organizację transportu lądowego z miejsca aukcji do portu</li>
                    <li>organizację transportu morskiego do Polski</li>
                    <li>obsługę odprawy celnej i akcyzy</li>
                    <li>transport pojazdu z portu pod wskazany przez Klienta adres w Polsce</li>
                    <li>przygotowanie kompletu dokumentów niezbędnych do rejestracji pojazdu</li>
                </ul>
                <p className="legal-p">
                    Zakres usług oraz szczegółowe warunki finansowe ustalane są indywidualnie z każdym Klientem
                    i potwierdzane w formie odrębnej umowy lub pisemnego zamówienia.
                </p>

                <h2 className="legal-h2">§ 4. Warunki współpracy i płatności</h2>
                <p className="legal-p">
                    Rozpoczęcie świadczenia usług następuje po:
                </p>
                <ul className="legal-ul">
                    <li>pisemnym potwierdzeniu warunków współpracy przez obie strony</li>
                    <li>uiszczeniu przez Klienta ustalonej zaliczki na poczet kosztów importu</li>
                </ul>
                <p className="legal-p">
                    Klient zobowiązany jest do terminowego regulowania płatności zgodnie z ustalonym harmonogramem.
                    Wszelkie koszty wynikłe ze zmian kursów walut, opłat aukcyjnych, portowych lub celnych,
                    o których Klient zostanie uprzednio poinformowany, obciążają Klienta.
                </p>

                <h2 className="legal-h2">§ 5. Obowiązki Spółki</h2>
                <p className="legal-p">Spółka zobowiązuje się do:</p>
                <ul className="legal-ul">
                    <li>działania w najlepszym interesie Klienta przy wyborze i zakupie pojazdu</li>
                    <li>informowania Klienta o każdym etapie importu, w tym poprzez zdjęcia z aukcji i przed załadunkiem</li>
                    <li>transparentnego rozliczenia wszystkich kosztów bez ukrytych opłat</li>
                    <li>dołożenia należytej staranności przy weryfikacji stanu technicznego i historii pojazdu</li>
                    <li>dostarczenia kompletu dokumentów niezbędnych do rejestracji pojazdu w Polsce</li>
                </ul>

                <h2 className="legal-h2">§ 6. Obowiązki Klienta</h2>
                <p className="legal-p">Klient zobowiązuje się do:</p>
                <ul className="legal-ul">
                    <li>podania prawdziwych i kompletnych danych niezbędnych do realizacji usługi</li>
                    <li>terminowego dostarczania wymaganych dokumentów i informacji</li>
                    <li>terminowej realizacji płatności</li>
                    <li>odebrania pojazdu w uzgodnionym terminie i miejscu</li>
                </ul>

                <h2 className="legal-h2">§ 7. Czas realizacji</h2>
                <p className="legal-p">
                    Orientacyjny czas importu pojazdu z USA lub Kanady do Polski wynosi od{' '}
                    <strong style={{color:'#F5F5F5'}}>6 do 12 tygodni</strong> od daty zakupu pojazdu na aukcji,
                    w zależności od lokalizacji pojazdu, dostępności transportu morskiego i sprawności odprawy celnej.
                </p>
                <p className="legal-p">
                    Spółka nie ponosi odpowiedzialności za opóźnienia wynikłe z przyczyn niezależnych od niej,
                    w szczególności z powodu działania siły wyższej, opóźnień portowych, strajków, decyzji organów
                    celnych lub innych okoliczności zewnętrznych.
                </p>

                <h2 className="legal-h2">§ 8. Odpowiedzialność</h2>
                <p className="legal-p">
                    Spółka odpowiada za szkody wynikłe z niewykonania lub nienależytego wykonania usługi
                    wyłącznie do wysokości wynagrodzenia uiszczonego przez Klienta za daną usługę.
                </p>
                <p className="legal-p">
                    Spółka nie ponosi odpowiedzialności za wady ukryte pojazdu niewidoczne przy standardowej
                    inspekcji na podstawie dostępnej dokumentacji aukcyjnej oraz za szkody wynikające
                    z informacji podanych przez Klienta niezgodnie z prawdą.
                </p>

                <h2 className="legal-h2">§ 9. Reklamacje</h2>
                <p className="legal-p">
                    Reklamacje dotyczące świadczonych usług należy składać drogą elektroniczną na adres{' '}
                    <a href="mailto:kontakt@mrfrik.pl">kontakt@mrfrik.pl</a> lub pisemnie na adres siedziby Spółki.
                </p>
                <p className="legal-p">
                    Reklamacja powinna zawierać: imię i nazwisko Klienta, opis problemu oraz oczekiwany sposób
                    rozwiązania. Spółka rozpatruje reklamacje w terminie <strong style={{color:'#F5F5F5'}}>14 dni roboczych</strong> od ich otrzymania.
                </p>

                <h2 className="legal-h2">§ 10. Ochrona danych osobowych</h2>
                <p className="legal-p">
                    Zasady przetwarzania danych osobowych Klientów określa{' '}
                    <Link href="/polityka-prywatnosci" style={{color:'#FD9731', textDecoration:'underline', textUnderlineOffset:'3px'}}>
                        Polityka Prywatności
                    </Link>{' '}
                    dostępna na stronie {siteHostname}/polityka-prywatnosci.
                </p>

                <h2 className="legal-h2">§ 11. Postanowienia końcowe</h2>
                <p className="legal-p">
                    W sprawach nieuregulowanych niniejszym Regulaminem stosuje się przepisy prawa polskiego,
                    w szczególności Kodeksu Cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.
                </p>
                <p className="legal-p">
                    Wszelkie spory wynikłe w związku z realizacją usług strony będą dążyć do rozwiązania
                    polubownie. W przypadku braku porozumienia sądem właściwym jest sąd właściwy dla siedziby Spółki.
                </p>
                <p className="legal-p">
                    Spółka zastrzega sobie prawo do zmiany Regulaminu. Zmiany wchodzą w życie z dniem ich
                    opublikowania na stronie {siteHostname}/regulamin.
                </p>

                <h2 className="legal-h2">§ 12. Kontakt</h2>
                <p className="legal-p">
                    <strong style={{color:'#F5F5F5'}}>PF Group Sp. z o.o.</strong><br />
                    ul. Bocianiej 29, 55-300 Środa Śląska<br />
                    NIP: 8982248331<br />
                    E-mail: <a href="mailto:kontakt@mrfrik.pl">kontakt@mrfrik.pl</a>
                </p>
            </div>
        </main>
    );
}
