'use client';

// `ssr: false` jest dozwolone tylko w Client Components (Next.js 15)
// Ten wrapper zapewnia, że App (Three.js, GSAP, navigator.*) ładuje się tylko po stronie klienta.
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App'), { ssr: false });

export default function ClientApp() {
    return <App />;
}
