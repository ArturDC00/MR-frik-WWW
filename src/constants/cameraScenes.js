// Definiujemy pozycję kamery (x, y, z) dla każdej sekcji
// To pozwala nam robić zbliżenia, oddalenia i obroty globu przy scrollowaniu.

export const CAMERA_SCENES = {
    hero: {
        position: [0, 0, 100], // Start: Pełny widok globu
        target: [0, 0, 0]
    },
    values: {
        position: [30, 20, 60], // Lekki obrót i zoom, pokazujemy dynamikę
        target: [5, 0, 0]
    },
    process: {
        position: [0, 40, 40], // Widok "z góry" na Atlantyk (trasa USA-Europa)
        target: [0, 0, 0]
    },
    platform: {
        position: [-40, 10, 60], // Zbliżenie z innej strony (Tech look)
        target: [-10, 0, 0]
    },
    trust: {
        position: [0, 0, 120], // Oddalenie, żeby pokazać "globalny zasięg" zaufania
        target: [0, 0, 0]
    },
    why_us: {
        position: [20, -20, 50], // Inna perspektywa
        target: [0, 0, 0]
    },
    faq: {
        position: [50, 0, 70], // Boczny widok
        target: [0, 0, 0]
    },
    contact: {
        position: [0, 0, 140], // Daleki odjazd na koniec (lub zbliżenie na Polskę)
        target: [0, 0, 0]
    }
};