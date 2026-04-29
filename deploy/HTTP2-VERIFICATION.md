# Weryfikacja HTTP/2 i HTTP/3 dla mrfrik.com

Lighthouse pokazuje **„Uses HTTP/1.1”** dla zasobów z originu, gdy połączenie **przeglądarka → pierwszy serwer TLS** negocjuje tylko HTTP/1.1. To **nie** jest to samo co `proxy_http_version 1.1` między nginx a Node (to jest poprawne).

Poniżej: **kolejność decyzyjna** (najpierw ustal, kto terminuje TLS), potem **kroki weryfikacji** i **typowe błędy**.

---

## Krok 0: Kto terminuje TLS dla `mrfrik.com`?

| Scenariusz | Jak sprawdzić |
|------------|----------------|
| **Vercel** | W panelu Vercel → Project → *Settings* → *Domains*: domena `mrfrik.com` jest przypisana i status *Valid*. W DNS u **registratora** rekordy wskazują na Vercel (np. `cname.vercel-dns.com` lub rekordy z instrukcji Vercel), a **nie** na IP VPS. |
| **Cloudflare (pomarańczowa chmura)** | DNS → rekord `A`/`CNAME` dla `@` i `www` ma **pomarańczowa chmura** (proxied). Ruch idzie przez Cloudflare; HTTP/2/3 zależy od ustawień CF. |
| **Tylko VPS (nginx + Let’s Encrypt)** | Rekord `A` wskazuje na IP serwera; **brak** Cloudflare proxy; certyfikat na nginx. HTTP/2 musi być w **aktywnym** bloku `listen 443 ssl …` na tym hoście. |

Jeśli **Vercel** ma domenę, ale DNS nadal wskazuje na **stary nginx**, przeglądarka łączy się z nginx → często brak `http2` w starym bloku → Lighthouse widzi h1.1.

---

## Krok 1: Chrome DevTools (obowiązkowa kontrola)

1. Otwórz `https://mrfrik.com/` (HTTPS, nie IP po HTTP).
2. **F12** → zakładka **Network**.
3. Kliknij **document** (pierwszy wiersz, typ „document”) dla głównego HTML.
4. W prawym panelu znajdź pole **Protocol** (Chrome: sekcja *General* lub kolumna *Protocol* po włączeniu jej PPM na nagłówki kolumn).

**Interpretacja:**

- `h2` — HTTP/2 działa do edge.
- `h3` — HTTP/3 (QUIC).
- `http/1.1` — **problem po stronie edge** (Vercel / Cloudflare / nginx), dopóki nie naprawisz TLS frontu.

Powtórz dla jednego pliku **CSS** i jednego **JS** z tej samej domeny — powinna być ta sama rodzina protokołu co dla dokumentu (multiplex na jednym połączeniu h2/h3).

---

## Krok 2: Wiersz poleceń (szybki test ALPN)

```bash
curl -sI -o /dev/null -w 'HTTP version: %{http_version}\n' "https://mrfrik.com/"
```

- Oczekiwane przy HTTP/2: **`HTTP version: 2`** (zależnie od wersji curl i serwera).

Szczegóły negocjacji TLS/ALPN:

```bash
echo | openssl s_client -alpn h2 -connect mrfrik.com:443 -servername mrfrik.com 2>/dev/null | openssl x509 -noout -subject -dates
echo | openssl s_client -alpn h2 -connect mrfrik.com:443 -servername mrfrik.com 2>&1 | grep -E 'ALPN|Protocol'
```

Szukasz potwierdzenia, że wybrany protokół aplikacji to **h2** (nie pusty ALPN tylko http/1.1).

---

## Krok 3: Vercel (gdy domena jest na Vercel)

1. **DNS:** Tylko rekordy z dokumentacji Vercel dla tej domeny. Usuń lub wyłącz **podwójne** wskazanie (np. `A` na VPS i jednocześnie CNAME na Vercel — zostaw jedną ścieżkę).
2. **Żadnego nginx przed Vercel** z własnym certyfikatem dla tej samej nazwy hosta — to „przechwytuje” ruch i obniża protokół, jeśli nginx nie ma HTTP/2.
3. Po zmianie DNS odczekaj TTL (często 5–60 min), potem powtórz Krok 1.

Vercel domyślnie serwuje ruch po **HTTP/2** (i HTTP/3 tam, gdzie jest włączone po stronie edge).

---

## Krok 4: Cloudflare

1. **SSL/TLS** → *Overview* → tryb **Full (strict)** (origin za nginx z ważnym certyfikatem) lub **Full**, jeśli origin ma self-signed (gorzej) — **unikaj Flexible** dla stron z własnym originem HTTPS.
2. **SSL/TLS** → *Edge Certificates* — włącz **HTTP/2** (zwykle domyślnie włączone).
3. **Speed** (lub **Network**) — włącz **HTTP/3 (with QUIC)** jeśli chcesz h3 w obsługiwanych klientach.
4. Upewnij się, że rekordy dla `mrfrik.com` / `www` są **Proxied** (pomarańczowa chmura), jeśli oczekujesz optymalizacji po stronie Cloudflare.

Po zmianach: Krok 1 + Krok 2.

---

## Krok 5: Nginx bezpośrednio na VPS (bez Cloudflare proxy)

1. Pokaż **efektywną** konfigurację (łączy pliki z `sites-enabled`):

   ```bash
   sudo nginx -T 2>/dev/null | grep -E 'server_name|listen.*443|http2|ssl_certificate'
   ```

2. W **aktywnym** `server { … }` dla `mrfrik.com` na porcie **443** musi być HTTP/2 w TLS, np.:

   ```nginx
   listen 443 ssl http2;
   listen [::]:443 ssl http2;
   ```

   W **nginx 1.25.1+** zalecany jest zapis:

   ```nginx
   listen 443 ssl;
   listen [::]:443 ssl;
   http2 on;
   ```

3. Po edycji:

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. Port **80** sam w sobie **nigdy** nie daje HTTP/2 dla ruchu klienta w sensie Lighthouse — liczy się **443 z certyfikatem**.

---

## Typowe przyczyny „nadal http/1.1”

| Przyczyna | Działanie |
|-----------|-----------|
| Test po **http://** (bez S) lub przez IP | Użyj `https://mrfrik.com` z prawidłowym SNIn. |
| Stary nginx **przed** Vercel / innym CDN | Usuń podwójne terminowanie TLS albo dodaj `http2` na tym nginx. |
| Cloudflare **DNS only** (szara chmura) | Ruch omija CF; HTTP/2 zależy wyłącznie od origin (nginx). |
| Zły `server_name` / domyślny serwer 443 | `curl -v` / DevTools pokazują inny certyfikat lub inny vhost. |
| Bardzo stary klient / proxy firmowy | Sprawdź z innej sieci lub telefonu komórkowego. |

---

## Fonty (subset, `font-display`)

- **Subset Inter:** zmniejsza WOFF2 — narzędzia: `glyphhanger`, `pyftsubset` (fonttools), lub pipeline z [google/fonts](https://github.com/google/fonts) z ograniczeniem unicode. Po subsetach zaktualizuj `unicode-range` w `globals.css` i pliki w `public/fonts/`.
- **`font-display`:** Projekt ma już **`swap`** dla Inter — dobry kompromis (tekst widoczny od razu, FOFT akceptowalny). **`optional`** ogranicza „blokowanie” jeszcze mocniej, ale częściej pokaże fallback, jeśli sieć jest wolna — decyzja produktowa, nie tylko Lighthouse.

---

## Bitrix24 a wynik „100”

Skrypty z zewnętrznego CDN (Bitrix) **nie da się** w pełni zoptymalizować w bundlerze aplikacji. Po naprawie **HTTP/2/3** na originie nadal mogą limitować wynik **third-party** i rozmiar widgetu — to jest **realistyczny sufit** bez rezygnacji z widgetu.
