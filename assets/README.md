# `assets/` — źródła buildu (NIE serwowane)

Nic z tego katalogu nie trafia do przeglądarki. To wejścia dla skryptów w `scripts/`.
`public/` zawiera tylko pliki, które są faktycznie referencjonowane z `src/`.

Powód wydzielenia: `public/` miało 101 MB, z czego 92 MB to pełnowymiarowe oryginały
(pojedyncze pliki do 15 MB), do których nie prowadziło żadne odwołanie w kodzie.
Po przeniesieniu `public/` ma 6,8 MB.

## `assets/photo-src/`

Oryginały AdobeStock / PNG, z których `scripts/optimize.mjs` generuje `.webp` do `public/Photo/`.
Struktura katalogów odpowiada `public/Photo/`.

```bash
# Regeneracja .webp z oryginału (skrypt zapisuje .webp OBOK wejścia):
node scripts/optimize.mjs "assets/photo-src/Glowna/AdobeStock_1108144587.jpeg"
# potem przenieś wynik tam, gdzie go oczekuje kod:
mv "assets/photo-src/Glowna/AdobeStock_1108144587.webp" public/Photo/Glowna/
```

## `assets/fonts-src/`

Niesubsetowane mastery Monument Extended (`.woff`). Z nich powstają
`public/fonts/MonumentExtended-*.subset.woff2` — patrz `scripts/subset-monument.sh`
i `deploy/PERF-MOBILE-FONTS-BUNDLE-IMAGES.md`.

## `assets/world.geojson`

Pełny Natural Earth (588 KB, 63 właściwości na feature, do 15 cyfr po przecinku).
`npm run slim-geojson` generuje z niego `public/world.geojson` (194 KB) — zostawia
4 właściwości, których faktycznie czyta kod, i 3 cyfry precyzji.
Nie edytuj `public/world.geojson` ręcznie: zostanie nadpisany.

## Uwaga o deployu

Deploy (`.github/workflows/deploy-www.yml`) robi `git reset --hard origin/main` na VPS,
więc ten katalog ląduje na dysku serwera. Nie jest serwowany, więc nie kosztuje ani
transferu, ani czasu odpowiedzi — tylko miejsce. `.vercelignore` wyklucza go ze ścieżki
wdrożeniowej Vercela.
