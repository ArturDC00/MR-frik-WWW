import './globals.css';
import './ui-overrides.css';
import { siteUrl } from '../config/site';
import { ImportCountProvider } from '../components/Providers/ImportCountProvider';
import { BitrixChatScript } from '../components/Providers/BitrixChatScript';

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: 'MrFrik — Import Samochodów z USA i Kanady do Polski',
    description:
        'MrFrik – profesjonalny import samochodów z USA i Kanady do Polski. Ponad 1500 sprowadzonych aut, 98% zadowolonych klientów. Pełna transparentność, weryfikacja VIN, transport morski, odprawa celna i dostawa pod dom.',
    keywords: [
        'import samochodów z USA',
        'sprowadzenie auta z Kanady',
        'import auta Polska',
        'MrFrik',
        'samochód z Ameryki',
        'aukcja Copart Polska',
        'IAAI import',
        'sprowadzenie auta',
        'import USA Polska',
    ],
    authors: [{ name: 'MrFrik' }],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },
    alternates: {
        canonical: `${siteUrl}/`,
    },
    openGraph: {
        type: 'website',
        url: `${siteUrl}/`,
        siteName: 'MrFrik Import',
        title: 'MrFrik — Import Samochodów z USA i Kanady do Polski',
        description:
            'Sprowadź wymarzone auto z USA lub Kanady. Ponad 1500 aut, 98% zadowolonych klientów. Weryfikacja VIN, transport, odprawa celna, dostawa pod dom.',
        images: [
            {
                url: `${siteUrl}/og-image.jpg`,
                width: 1200,
                height: 630,
                alt: 'MrFrik — Import Samochodów z USA i Kanady',
            },
        ],
        locale: 'pl_PL',
    },
    twitter: {
        card: 'summary_large_image',
        site: '@mrfrik',
        creator: '@mrfrik',
        title: 'MrFrik — Import Samochodów z USA i Kanady',
        description:
            'Sprowadź wymarzone auto z USA lub Kanady. Ponad 1500 aut, pełna transparentność, dostawa pod dom.',
        images: [`${siteUrl}/og-image.jpg`],
    },
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.json',
    other: {
        'theme-color': '#FD9731',
        'msapplication-TileColor': '#020203',
    },
};

const jsonLdBase = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'AutoDealer',
            '@id': 'https://mrfrik.pl/#organization',
            name: 'MrFrik Import',
            alternateName: 'MrFrik',
            url: 'https://mrfrik.pl',
            logo: {
                '@type': 'ImageObject',
                url: 'https://mrfrik.pl/models/MrFrik_reBranding_logo_2025-13.png',
                width: 3508,
                height: 2481,
            },
            description:
                'Profesjonalny import samochodów z USA i Kanady do Polski. Weryfikacja VIN, Carfax, transport morski, odprawa celna, dostawa pod dom.',
            legalName: 'PF Group Sp. z o.o.',
            vatID: 'PL8982248331',
            email: 'kontakt@mrfrik.pl',
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'ul. Bocianiej 29',
                addressLocality: 'Środa Śląska',
                postalCode: '55-300',
                addressCountry: 'PL',
            },
            foundingDate: '2020',
            areaServed: { '@type': 'Country', name: 'Polska' },
            serviceArea: [{ '@type': 'Country', name: 'Polska' }],
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: 'kontakt@mrfrik.pl',
                availableLanguage: ['Polish', 'English'],
                contactOption: 'TollFree',
            },
            sameAs: [
                'https://instagram.com/mrfrik',
                'https://youtube.com/@mrfrik',
                'https://t.me/mrfrik',
            ],
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                reviewCount: '1500',
                bestRating: '5',
                worstRating: '1',
            },
            review: [
                {
                    '@type': 'Review',
                    author: { '@type': 'Person', name: 'Hubert N.' },
                    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                    reviewBody: 'Chłopaki robią super robotę - zawsze doradzą, pomogą i ogarną wszystko od A do Z. Współpraca bez stresu i pełne zaufanie.',
                },
                {
                    '@type': 'Review',
                    author: { '@type': 'Person', name: 'Maciej C.' },
                    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                    reviewBody: 'Ekipa MrFrik naprawdę spełnia marzenia. Świetny kontakt i wszystko jasno wyjaśnione. Zero zaskoczeń, zero rozczarowań, a samochód po naprawie to po prostu czysta poezja.',
                },
                {
                    '@type': 'Review',
                    author: { '@type': 'Person', name: 'Bogusław Cz.' },
                    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
                    reviewBody: 'Super sprawa. Firma rzetelna, stały kontakt, zdjęcia z aukcji i przed załadunkiem. Żadnych dodatkowych ukrytych opłat. Z czystym sumieniem mogę polecić.',
                },
            ],
        },
        {
            '@type': 'Service',
            '@id': 'https://mrfrik.pl/#service-import',
            name: 'Import Samochodów z USA i Kanady',
            provider: { '@id': 'https://mrfrik.pl/#organization' },
            description:
                'Kompleksowy import samochodów z USA i Kanady: wybór auta z aukcji (Copart, IAAI, Impact Auto), weryfikacja VIN i Carfax, transport morski, odprawa celna, dostawa pod dom.',
            areaServed: { '@type': 'Country', name: 'Polska' },
            hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Usługi Importu Aut',
                itemListElement: [
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Service',
                            name: 'Wybór i zakup auta z aukcji USA/Kanada',
                        },
                    },
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Service',
                            name: 'Weryfikacja pojazdu — Carfax, VIN, inspekcja',
                        },
                    },
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Service',
                            name: 'Transport morski i odprawa celna',
                        },
                    },
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Service',
                            name: 'Dostawa samochodu pod dom w Polsce',
                        },
                    },
                ],
            },
        },
        {
            '@type': 'WebSite',
            '@id': 'https://mrfrik.pl/#website',
            url: 'https://mrfrik.pl',
            name: 'MrFrik Import',
            inLanguage: 'pl',
            publisher: { '@id': 'https://mrfrik.pl/#organization' },
            potentialAction: {
                '@type': 'SearchAction',
                target: 'https://mrfrik.pl/?q={search_term_string}',
                'query-input': 'required name=search_term_string',
            },
        },
        {
            '@type': 'FAQPage',
            '@id': 'https://mrfrik.pl/#faq',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'Czy mogę sam wybrać auto z aukcji w USA lub Kanadzie?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Tak, oczywiście! To Ty decydujesz, jakie auto chcesz sprowadzić. Wspólnie analizujemy oferty z popularnych aukcji (Copart, IAAI, Impact Auto oraz aukcji dealerskich), a następnie pomagamy Ci wybrać najkorzystniejsze opcje. Naszym celem jest znalezienie samochodu, który w pełni spełni Twoje oczekiwania.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Ile kosztuje sprowadzenie auta z USA lub Kanady do Polski?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Całkowity koszt importu auta z USA lub Kanady zależy od kilku czynników: ceny wylicytowanego samochodu, kosztów transportu lądowego oraz morskiego, opłat celnych, akcyzy oraz ewentualnych napraw. Informujemy Cię o kosztach sprowadzenia auta jeszcze przed rozpoczęciem procesu.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Jak długo trwa sprowadzenie samochodu?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Średni czas importu auta zza oceanu wynosi od 6 do 10 tygodni, w zależności od miejsca zakupu, dostępności transportu i odprawy celnej. Na bieżąco informujemy Cię o każdym etapie.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Czy pomagacie w rejestracji auta w Polsce?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Nie zajmujemy się bezpośrednio rejestracją pojazdu w Polsce, ale kompleksowo przygotowujemy wszystkie niezbędne dokumenty. Otrzymasz pełen zestaw papierów wymaganych do odprawy celnej, akcyzy i rejestracji.',
                    },
                },
                {
                    '@type': 'Question',
                    name: 'Czy sprowadzane auta są uszkodzone?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Większość sprowadzanych przez nas samochodów to auta powypadkowe lub lekko uszkodzone, co pozwala kupić sprawdzony samochód w dużo niższej cenie. Przed zakupem dokładnie weryfikujemy historię pojazdu (Carfax) i analizujemy zakres uszkodzeń.',
                    },
                },
            ],
        },
    ],
};

const jsonLd = JSON.parse(
    JSON.stringify(jsonLdBase).replace(/https:\/\/mrfrik\.pl/g, siteUrl),
);

export default function RootLayout({ children }) {
    return (
        <html lang="pl">
            <head>
                {/* Inter — preload w <head> + fetchPriority: wcześniejszy start niż @font-face z CSS (LCP) */}
                <link
                    rel="preload"
                    href="/fonts/inter-latin.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                    fetchPriority="high"
                />
                <link
                    rel="preload"
                    href="/fonts/inter-latin-ext.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                {/* Brak preconnect do images.unsplash.com — obrazy idą przez next/image; zbędny preconnect = ostrzeżenie Lighthouse */}

                {/* Inter + Monument Extended — pełne @font-face w globals.css */}

                {/* JSON-LD Structured Data — krytyczne dla SEO/GEO/AI search */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body>
            <ImportCountProvider>{children}</ImportCountProvider>
            <BitrixChatScript />
        </body>
        </html>
    );
}
