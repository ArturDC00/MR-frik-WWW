/**
 * Odchudza world.geojson do tego, co aplikacja faktycznie czyta.
 *
 *   node scripts/slim-geojson.mjs
 *   assets/world.geojson (źródło, Natural Earth)  →  public/world.geojson (serwowane)
 *
 * Dwie oszczędności:
 *
 * 1. WŁAŚCIWOŚCI. Źródło ma 63 klucze na feature (pop_est, gdp_md, iso_a3, wikidataid,
 *    fclass_* i reszta Natural Earth). Kod czyta dokładnie cztery:
 *      - ElegantGlobe.jsx:  properties.NAME || properties.name || properties.admin
 *      - App.jsx (handleGlobeEvent): properties.admin || properties.name || properties.name_long
 *    Resztę wyrzucamy.
 *
 * 2. PRECYZJA WSPÓŁRZĘDNYCH. Źródło trzyma do 15 cyfr po przecinku — czysty szum float.
 *    3 cyfry to ~111 m na równiku. Globus ma promień 32 jednostki i renderuje się na ~1000 px
 *    szerokości, więc jeden piksel to ~2-4 km. Zaokrąglenie jest o rząd wielkości poniżej
 *    progu widoczności; granice wyglądają identycznie.
 *
 * Nie ruszamy topologii ani liczby punktów — kształty krajów zostają 1:1, więc
 * point-in-polygon (wybór kraju klikiem/hoverem) daje te same wyniki.
 */

import { readFile, writeFile, stat } from 'fs/promises';
import { gzipSync } from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SRC = path.join(ROOT, 'assets', 'world.geojson');
const OUT = path.join(ROOT, 'public', 'world.geojson');

/** Jedyne klucze, po które sięga kod. */
const KEEP_PROPS = ['NAME', 'name', 'admin', 'name_long'];
const DECIMALS = 3;

const round = (n) => {
    const r = Number(n.toFixed(DECIMALS));
    // -0 serializuje się jako "-0"; zero to zero.
    return Object.is(r, -0) ? 0 : r;
};

function roundCoords(c) {
    if (typeof c[0] === 'number') return c.map(round);
    return c.map(roundCoords);
}

const src = JSON.parse(await readFile(SRC, 'utf8'));

const out = {
    type: src.type,
    features: src.features.map((f) => {
        const props = {};
        for (const k of KEEP_PROPS) {
            if (f.properties?.[k] != null) props[k] = f.properties[k];
        }
        return {
            type: f.type,
            properties: props,
            geometry: { type: f.geometry.type, coordinates: roundCoords(f.geometry.coordinates) },
        };
    }),
};

await writeFile(OUT, JSON.stringify(out));

const [a, b] = await Promise.all([stat(SRC), stat(OUT)]);
const gzOf = async (p) => gzipSync(await readFile(p), { level: 9 }).length;
const [ga, gb] = await Promise.all([gzOf(SRC), gzOf(OUT)]);
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const pct = (x, y) => (((x - y) / x) * 100).toFixed(1) + '%';

console.log(`features:  ${out.features.length}`);
console.log(`raw:       ${kb(a.size)} → ${kb(b.size)}  (-${pct(a.size, b.size)})`);
console.log(`gzip:      ${kb(ga)} → ${kb(gb)}  (-${pct(ga, gb)})`);
