/**
 * Bitrix24 — tworzenie leada (crm.lead.add)
 * ==========================================
 * Implementacja: `src/app/api/lead/route.js` (POST). Formularz w `ContactSection.jsx`
 * wysyła JSON na `/api/lead`; zmienna środowiskowa `BITRIX24_WEBHOOK_BASE` tylko po stronie serwera.
 *
 * INBOUND WEBHOOK (REST)
 * ----------------------
 * W Bitrix24: Aplikacje → Webhooky przychodzące → uprawnienia m.in. `crm`.
 * URL ma postać (bez metody na końcu w zmiennej środowiskowej):
 *   https://<portal>.bitrix24.pl/rest/<USER_ID>/<SECRET>/
 * Wywołanie metody: dopisz `crm.lead.add.json` → pełny URL do POST.
 *
 * Przykład odpowiedzi sukcesu: `{ "result": <ID_LEADA>, "time": { ... } }`
 * (ID w CRM to liczba zwrócona w `result`).
 *
 * BEZPIECZEŃSTWO
 * --------------
 * NIE wklejaj sekretu webhooka do repo ani do kodu klienckiego (`'use client'`).
 * Trzymaj bazę URL w `.env.local` jako np. `BITRIX24_WEBHOOK_BASE=...` i wołaj Bitrix
 * wyłącznie z Route Handler / Server Action (`process.env` po stronie serwera).
 *
 * METODA HTTP
 * -----------
 * `POST` na `.../crm.lead.add.json`
 * Treść: `application/json` z kluczem `fields`, albo `application/x-www-form-urlencoded`
 * z polami `fields[TITLE]`, `fields[NAME]`, itd. (zgodnie z dokumentacją REST).
 *
 * POLA (do ustalenia z klientem — typowe)
 * ---------------------------------------
 * - `TITLE` — tytuł leada (np. „Zapytanie WWW — import USA”).
 * - `NAME`, `SECOND_NAME`, `LAST_NAME` — opcjonalnie rozdzielone.
 * - `PHONE` — tablica wielowartościowa: `[{ VALUE: '+48...', VALUE_TYPE: 'WORK' }]`.
 * - `EMAIL` — analogicznie.
 * - `COMMENTS` — pełna treść z formularza (typ auta, budżet, model).
 * - `SOURCE_ID`, `UTM_*`, pola niestandardowe (`UF_CRM_...`) — wg konfiguracji CRM.
 *
 * Dokumentacja: https://apidocs.bitrix24.com/api-reference/crm/leads/crm-lead-add.html
 */

export {};
