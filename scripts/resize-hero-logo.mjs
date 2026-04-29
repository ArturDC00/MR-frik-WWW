/**
 * Zmniejsza logo hero do sensownej szerokości dla next/image (mniejszy dekod PNG → lepszy LCP).
 * Uruchom z katalogu głównym repo: node scripts/resize-hero-logo.mjs
 *
 * Wejście domyślne: public/models/MrFrik_reBranding_logo_2025-13.png
 * Wyjście:        public/models/MrFrik_reBranding_logo_2025-13-display.png
 */
import sharp from 'sharp';
import { stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const INPUT = path.join(root, 'public/models/MrFrik_reBranding_logo_2025-13.png');
const OUTPUT = path.join(root, 'public/models/MrFrik_reBranding_logo_2025-13-display.png');
/** ~2× max szerokość z HeroContent (desktop 240) */
const MAX_WIDTH = 560;

async function main() {
    try {
        await stat(INPUT);
    } catch {
        console.error('Brak pliku:', INPUT);
        console.error('Skopiuj źródłowy PNG do public/models/ i uruchom ponownie.');
        process.exit(1);
    }
    const meta = await sharp(INPUT).metadata();
    const pipeline = sharp(INPUT).rotate();
    const resized =
        meta.width && meta.width > MAX_WIDTH
            ? pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true })
            : pipeline;
    const info = await resized.png({ compressionLevel: 9, effort: 10 }).toFile(OUTPUT);

    console.log('Zapisano:', OUTPUT);
    console.log('Meta wejście:', meta.width, '×', meta.height, '→ wyjście:', info.width, '×', info.height);
    console.log('Podmień src w HeroContent / StaticHeroPlaceholder / ContactSection / config na ...-display.png lub nadpisz oryginał po backupie.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
