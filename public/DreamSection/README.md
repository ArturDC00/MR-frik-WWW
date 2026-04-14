# DreamSection - Scroll-Driven 3D Storytelling

## Instalacja

1. Skopiuj folder `DreamSection/` do `src/components/Sections/`
2. Model GLB musi być dostępny pod: `public/DreamSection/porsche_911_gt3.glb`

```bash
mkdir -p public/DreamSection
cp DreamSection/porsche_911_gt3.glb public/DreamSection/
```

## Jak działa

Sekcja używa GSAP ScrollTrigger z `pin: true` i `scrub: 1` - trzyma widok w miejscu przez 4000px scrollu.

### Scroll States (0-5):

- **0-1** (0-20% scrollu): Wireframe auto wjeżdża, tekst "Marzenie z Ameryki..."
- **1-2** (20-40%): Auto solid white, tekst "...staje się realnym planem."
- **2-3** (40-60%): Auto kolorowe, tekst "Dlaczego setki klientów wybrało nas?"
- **3-4** (60-80%): Karta 1 aktywna (Pełna transparentność)
- **4-5** (80-100%): Karta 2 aktywna (Kompleksowa obsługa)

### Komponenty:

**PorscheModel** - renderuje GLB, zmienia material (wireframe → solid → color) w zależności od `scrollState`

**GlassCard** - szklana karta po lewej z glassmorphism efektem (`backdrop-filter: blur(27px)`)

## TODO - Co musisz dodać:

### 1. Wideo w tle (backgrounds)
Obecnie tło to gradient. Dodaj 3 wideo za rozmytym efektem:

```jsx
<video 
  style={{
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    filter: 'blur(20px)',
    opacity: scrollState >= 3 ? 1 : 0,
  }}
  autoPlay loop muted playsInline
  src="/videos/bg-1.mp4"
/>
```

### 2. Zdjęcia w kartach
W `GlassCard` component dodaj:

```jsx
{data.image && (
  <img 
    src={data.image} 
    alt={data.title}
    style={{
      width: '636px',
      height: '321px',
      borderRadius: '23px',
      objectFit: 'cover',
    }}
  />
)}
```

Zmieniając w `content` object:
```js
3: {
  title: "Pełna transparentność",
  subtitle: "Dostęp do wszystkich kosztów i raportów Carfax.",
  image: "/images/monitor-carfax.jpg", // ← dodaj ścieżkę
},
```

### 3. Font "Monument Extended"
Obecnie używa fallback `sans-serif`. Dodaj w `GlobalStyles.js`:

```js
@font-face {
  font-family: 'Monument Extended';
  src: url('/fonts/MonumentExtended-Regular.woff2') format('woff2');
  font-weight: 400;
}
@font-face {
  font-family: 'Monument Extended';
  src: url('/fonts/MonumentExtended-Bold.woff2') format('woff2');
  font-weight: 800;
}
```

## Responsywność (Mobile)

Obecna wersja desktop-only. Dla mobile dodaj media query:

```jsx
const isMobile = window.innerWidth < 768;

// W card position:
left: isMobile ? '20px' : '80px',
width: isMobile ? 'calc(100vw - 40px)' : '690px',

// W Canvas position:
right: isMobile ? 0 : (scrollState < 2.5 ? '50%' : '10%'),
```

## Performance

Model GLB (4.8MB) jest preloadowany razem z sekcją dzięki React.lazy w App.jsx.
Jeśli FPS spada, zmniejsz `scrub` value w ScrollTrigger z `1` na `0.5`.
