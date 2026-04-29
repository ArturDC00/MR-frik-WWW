# Mobile LCP: fonty Monument, analiza bundla JS, logo PNG

**W repozytorium (2025-04):** `MonumentExtended-*.subset.woff2` z zakresem `0020-007E,00A0-00FF,0100-017F,2013,2014,2026,20AC` (ASCII + Latin-1 + Latin Extended-A + — … €). Logo hero: `MrFrik_reBranding_logo_2025-13-display.png` (560 px szer.). Odtworzenie subsetów — patrz sekcja 1 poniżej.

Kontekst: po HTTP/2 główny sufit mobile to **LCP**, **fonty** (Monument WOFF), **TBT** (duże chunki JS), **obraz logo** (duży plik źródłowy mimo `next/image`).

---

## 1. Subset `MonumentExtended-Ultrabold.woff` (i ewent. Regular)

**Cel:** zostawić tylko glyfy użyte w UI (nagłówki, CTA), zmniejszyć transfer i czas dekodowania.

### Opcja A — `pyftsubset` (fonttools, WOFF → subset WOFF2)

```bash
pip install fonttools brotli zopfli
# subset: tylko wybrane znaki (dopasuj do realnych stringów na stronie)
pyftsubset public/fonts/MonumentExtended-Ultrabold.woff \
  --output-file=public/fonts/MonumentExtended-Ultrabold.subset.woff2 \
  --flavor=woff2 \
  --layout-features=* \
  --glyph-names \
  --symbol-cmap \
  --legacy-cmap \
  --notdef-glyph \
  --notdef-outline \
  --recommended-glyphs \
  --unicodes="U+0020-007E,U+00A0,U+0104,U+0105,U+0106,U+0107,U+0118,U+0119,U+0141,U+0142,U+0143,U+0144,U+00D3,U+00F3,U+015A,U+015B,U+0179,U+017A,U+017B,U+017C"
```

- Rozszerz `--unicodes=` o **wszystkie** litery z `HeroContent`, nawigacji, stopki (wielkie litery w Monument).
- Po wygenerowaniu pliku: w `globals.css` podmień `src:` na `.woff2` subset i dodaj `unicode-range` odpowiadający subsetowi (żeby przeglądarka nie pobierała fontu na nieużywane strony).

### Opcja B — `glyphhanger` (spider strony + subset)

```bash
npm i -g glyphhanger
glyphhanger https://mrfrik.com/ --subset=public/fonts/MonumentExtended-Ultrabold.woff --formats=woff2
```

Wymaga uruchomionej strony; wynik weryfikuj w `globals.css` / `layout.jsx` (preload tylko jeśli nadal krytyczny).

### `font-display`

- **`swap`** (obecnie) — tekst od razu, potem podmiana fontu; bezpieczne dla marki.
- **`optional`** dla Monument **tylko** jeśli akceptujecie krótki moment fallbacku (Inter) przy wolnej sieci — może poprawić LCP w audycie, kosmetycznie zmienia wygląd pierwszego paintu.

### Hero bez Monument przy pierwszym paintcie

Kompromis produktowy: pierwsza linia H1 w **Inter 800** / system-ui, Monument dopiero po `fontfacesetloading` lub od drugiego sekcji — duży zysk LCP, zmiana wyglądu. Decyzja poza samym subsetem.

---

## 2. Analiza dużych chunków (`bd904a5c`, `692`, `255`…)

**Hash nazw zmienia się co build** — ważne jest **co jest w środku**, nie nazwa pliku.

### Lokalnie: Bundle Analyzer (w repo)

```bash
npm run analyze
```

Otworzy interaktywną mapę webpacka po `next build`. Szukaj:

- **dużych paczek** (`three`, `framer-motion`, `@react-three/drei`, `gsap` jeśli importowany),
- **wspólnego chunku** strony głównej vs lazy route.

### Mapowanie moduł → plik

```bash
npx next build --experimental-debug-memory-usage
# lub po buildzie, w .next — narzędzia typu source-map-explorer na konkretnym .js z .next/static/chunks/
```

### Dalszy code-splitting

- Już używacie `next/dynamic` dla WebGL i sekcji — **nie** dynamicznie importujcie pojedynczych hooków z `three` poza canvasem.
- Sprawdźcie **barrel imports**: `import { X } from 'three'` rozważcie zastąpieniem `import { X } from 'three/addons/...'` lub ścieżek tree-shake friendly (tam gdzie ma sens).
- **GSAP**: importuj tylko używane pluginy, nie cały `gsap/all`.
- **Polyfille**: `browserslist` w `package.json` jest już nowoczesny; reszta „legacy” często pochodzi z **Next runtime** i zależności — nie da się wyzerować bez kosztów.

---

## 3. Logo `MrFrik_reBranding_logo_2025-13.png`

`next/image` generuje **AVIF/WebP** z **oryginału** — im mniejszy i prostszy **PNG wejściowy**, tym mniej pracy CPU i mniejszy transfer przy pierwszym żądaniu.

### Skrypt w repozytorium

```bash
node scripts/resize-hero-logo.mjs
```

Tworzy `public/models/MrFrik_reBranding_logo_2025-13-display.png` (max szer. 560 px, ~2× wyświetlane 240). **Podmień ścieżkę w `HeroContent` / `StaticHeroPlaceholder` / `ContactSection` / `LOGO_PATH`**, gdy plik jest zaakceptowany wizualnie, albo nadpisz oryginał kopiami z backupu.

### Ręcznie (Figma / Eksport)

Eksport **2× rozmiaru wyświetlanego** (np. 480×340 dla max 240×170), bez zbędnego 3508 px.

---

## 4. Realistyczny cel mobile

**100/100** przy WebGL + animacjach + Bitrix jest **rzadkoosiągalne**. Subset fontów, mniejsze logo, dalszy split JS i dopracowanie LCP hero często dają **ok. 80–92** — to już bardzo dobry wynik dla tego typu strony.
