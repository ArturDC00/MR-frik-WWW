import Link from 'next/link';

export const metadata = {
    title: 'Nie znaleziono strony — MrFrik',
    description: 'Strona, której szukasz, nie istnieje lub została przeniesiona.',
};

export default function NotFound() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            background: '#020203',
            color: '#F5F5F5',
            fontFamily: 'Inter, sans-serif',
            padding: '40px 20px',
            textAlign: 'center',
        }}>
            <p style={{
                fontSize: 'clamp(80px, 15vw, 160px)',
                fontFamily: '"Monument Extended", sans-serif',
                fontWeight: 700,
                lineHeight: 1,
                margin: 0,
                WebkitTextStroke: '2px #FD9731',
                color: 'transparent',
                textShadow: '0 0 40px rgba(253, 151, 49, 0.3)',
            }}>
                404
            </p>
            <h1 style={{
                fontSize: 'clamp(20px, 3vw, 32px)',
                fontWeight: 600,
                margin: 0,
            }}>
                Nie znaleziono strony
            </h1>
            <p style={{
                fontSize: 'clamp(14px, 1.5vw, 18px)',
                color: 'rgba(245, 245, 245, 0.7)',
                maxWidth: '480px',
                lineHeight: 1.6,
                margin: 0,
            }}>
                Strona, której szukasz, nie istnieje lub została przeniesiona.
            </p>
            <Link
                href="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '16px',
                    padding: '14px 32px',
                    borderRadius: '100px',
                    background: 'linear-gradient(135deg, #FD9731 0%, #CF6A05 100%)',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 4px 24px rgba(253,151,49,0.35)',
                    transition: 'filter 0.2s ease',
                    minHeight: '44px',
                }}
            >
                ← Wróć na stronę główną
            </Link>
        </main>
    );
}
