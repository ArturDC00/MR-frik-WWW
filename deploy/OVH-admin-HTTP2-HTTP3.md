# Instrukcja dla admina: HTTP/2 i HTTP/3 na VPS OVH (nginx + Let’s Encrypt)

Założenia: **DNS** (`A` dla `@` i `www`) wskazuje na **publiczny IP** tego VPS-a. Ruch HTTPS kończy **nginx** na porcie **443**, a do aplikacji Next idzie **proxy** na `127.0.0.1:3005` (HTTP/1.1 między nginx a Node jest **prawidłowe**).

---

## 1. HTTP/2 (obowiązkowe — to usuwa „http/1.1” w Lighthouse)

### 1.1 Sprawdź wersję nginx

```bash
nginx -v
```

- **Nginx &lt; 1.25.1:** w bloku `server` dla TLS użyj w jednej linii:

  ```nginx
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  ```

- **Nginx ≥ 1.25.1:** zalecany zapis:

  ```nginx
  listen 443 ssl;
  listen [::]:443 ssl;
  http2 on;
  ```

### 1.2 Gdzie to wpisać

Po `certbot --nginx` certbot zwykle **dopisuje** osobny `server { … }` na **443** w tym samym pliku w `sites-available` (np. `/etc/nginx/sites-available/mrfrik`).

Admin musi **w aktywnym** bloku `server` dla `mrfrik.com` / `www.mrfrik.com` na porcie **443**:

- mieć `ssl_certificate` i `ssl_certificate_key` (Let’s Encrypt),
- oraz **HTTP/2** jak wyżej (`http2` w `listen` **albo** `http2 on;`).

### 1.3 Weryfikacja przed przeładowaniem

```bash
sudo nginx -t
```

Jeśli OK:

```bash
sudo systemctl reload nginx
```

### 1.4 Kontrola z zewnątrz

Na swoim komputerze (albo z VPS):

```bash
curl -sI -o /dev/null -w 'HTTP: %{http_version}\n' 'https://mrfrik.com/'
```

Oczekiwanie: **`HTTP: 2`**.

W Chrome: **DevTools → Network → dokument HTML → Protocol = h2**.

---

## 2. HTTP/3 (QUIC) — opcjonalnie, trudniejsze na „czystym” nginx

HTTP/3 wymaga od nginx **obsługi QUIC** (odpowiednia **wersja nginx** + **OpenSSL** z QUIC, często **osobna** kompilacja lub pakiet z backportem). Na wielu instalacjach z `apt install nginx` **jest tylko HTTP/2**, nie HTTP/3.

**Praktyczne opcje dla OVH:**

| Wariant | Kto daje HTTP/3 | Uwagi |
|--------|------------------|--------|
| **A. Cloudflare** (pomarańczowa chmura przed VPS) | Edge Cloudflare | W panelu CF: włączyć **HTTP/3 (with QUIC)**. Na VPS nadal warto mieć **HTTP/2** do originu. |
| **B. Tylko nginx na VPS** | Sam admin | Upgrade do pakietu/nginx z QUIC **albo** obraz z nowszym nginx; wymaga testów i często innej ścieżki niż „tylko apt”. |

Rekomendacja biznesowa: **najpierw wdrożyć pewne HTTP/2 na 443** (punkt 1). HTTP/3 jako **drugi krok** — najczęściej przez **Cloudflare**, jeśli domena i polityka na to pozwalają.

---

## 3. Typowe błędy na OVH

1. **Tylko blok na porcie 80** — Lighthouse patrzy na **HTTPS**; HTTP/2 musi być na **443**.
2. **Stary `listen 443 ssl;` bez `http2`** — przeglądarka zostaje na HTTP/1.1.
3. **Dwa nginx / zły plik w `sites-enabled`** — `sudo nginx -T | grep -E 'server_name|listen.*443|http2'` i upewnić się, że **aktywny** vhost dla `mrfrik.com` ma poprawny `listen`.
4. **Cloudflare „DNS only” (szara chmura)** — ruch nie przechodzi przez HTTP/3 CF; liczy się wyłącznie konfiguracja **nginx na VPS** (wtedy HTTP/3 tylko jeśli nginx to obsługuje).

---

## 4. Krótka lista poleceń dla admina (kolejność)

```bash
# 1) Pełna konfiguracja nginx (szukaj server { ... 443 ... mrfrik.com)
sudo nginx -T | less

# 2) Edycja pliku vhosta (nazwa pliku dopasuj do instalacji)
sudo nano /etc/nginx/sites-available/mrfrik

# 3) W bloku listen 443 dodać http2 (patrz sekcja 1.1)

# 4) Test i reload
sudo nginx -t && sudo systemctl reload nginx

# 5) Kontrola
curl -sI -o /dev/null -w 'HTTP: %{http_version}\n' 'https://mrfrik.com/'
```

Szerszy opis (Vercel / CF / openssl): [`HTTP2-VERIFICATION.md`](./HTTP2-VERIFICATION.md).
