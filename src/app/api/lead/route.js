import { NextResponse } from 'next/server';

function normalizeWebhookBase(raw) {
    if (!raw || typeof raw !== 'string') return '';
    let s = raw.trim().replace(/^\uFEFF/, '').replace(/\s+/g, '');
    // Pełny URL metody w env → obetnij, żeby nie robić .../crm.lead.add/crm.lead.add.json
    s = s.replace(/\/crm\.lead\.add(\.json)?\/?$/i, '');
    s = s.replace(/\/crm\.item\.add(\.json)?\/?$/i, '');
    return s.replace(/\/+$/, '') + '/';
}

function isBitrixMethodNotFound(bxJson) {
    const err = String(bxJson?.error ?? '');
    const desc = String(bxJson?.error_description ?? '').toLowerCase();
    return (
        err === 'METHOD_NOT_FOUND' ||
        err.toLowerCase().includes('method_not_found') ||
        desc.includes('method not found')
    );
}

function bitrixErrorMessage(bxJson) {
    if (typeof bxJson?.error_description === 'string' && bxJson.error_description) {
        return bxJson.error_description;
    }
    if (bxJson?.error != null) return String(bxJson.error);
    return 'Błąd Bitrix24.';
}

function extractCreatedId(bxJson) {
    const r = bxJson?.result;
    if (r == null) return null;
    if (typeof r === 'number') return r;
    if (typeof r === 'object' && r.id != null) return r.id;
    if (typeof r === 'object' && r.item != null && typeof r.item === 'object' && r.item.id != null) {
        return r.item.id;
    }
    return null;
}

async function bitrixJsonPost(base, method, jsonBody) {
    const url = `${base}${method}.json`;
    const bxRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(jsonBody),
        cache: 'no-store',
    });
    try {
        return await bxRes.json();
    } catch {
        return { error: 'INVALID_JSON', error_description: 'Niepoprawna odpowiedź CRM.' };
    }
}

/**
 * POST /api/lead — lead w Bitrix24 przez inbound webhook: crm.lead.add, z fallbackiem crm.item.add (entityTypeId 1).
 * Wymaga BITRIX24_WEBHOOK_BASE w .env.local, np. https://portal.bitrix24.pl/rest/USER/TOKEN/
 */
export async function POST(request) {
    const base = normalizeWebhookBase(process.env.BITRIX24_WEBHOOK_BASE);
    if (!base) {
        return NextResponse.json(
            { error: 'Brak konfiguracji CRM (BITRIX24_WEBHOOK_BASE).' },
            { status: 503 },
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Nieprawidłowe dane.' }, { status: 400 });
    }

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const carType = String(body.carType || '').trim();
    const model = String(body.model || '').trim().slice(0, 120);
    const budget = String(body.budget || '').trim();

    if (!name || !phone || !email || !carType) {
        return NextResponse.json({ error: 'Uzupełnij wymagane pola.' }, { status: 400 });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
        return NextResponse.json({ error: 'Nieprawidłowy adres e-mail.' }, { status: 400 });
    }

    const title = `WWW — ${carType}${model ? ` — ${model}` : ''}`.slice(0, 255);
    const comments = [
        `Typ auta: ${carType}`,
        `Model: ${model || 'nie podano'}`,
        `Budżet: ${budget || 'nie podano'}`,
        `Imię i nazwisko: ${name}`,
        `Telefon: ${phone}`,
        `E-mail: ${email}`,
    ].join('\n');

    const parts = name.split(/\s+/);
    const firstName = parts[0]?.slice(0, 50) || name.slice(0, 50);
    const lastName = parts.length > 1 ? parts.slice(1).join(' ').slice(0, 50) : '';

    const leadAddPayload = {
        fields: {
            TITLE: title,
            NAME: firstName,
            ...(lastName ? { LAST_NAME: lastName } : {}),
            PHONE: [{ VALUE: phone.slice(0, 40), VALUE_TYPE: 'WORK' }],
            EMAIL: [{ VALUE: email.slice(0, 80), VALUE_TYPE: 'WORK' }],
            COMMENTS: comments.slice(0, 6000),
        },
    };

    /** Universal CRM (nowsze portale) — lead = entityTypeId 1, pola camelCase. */
    const itemAddPayload = {
        entityTypeId: 1,
        fields: {
            title,
            name: firstName,
            ...(lastName ? { lastName } : {}),
            phone: [{ value: phone.slice(0, 40), valueType: 'WORK' }],
            email: [{ value: email.slice(0, 80), valueType: 'WORK' }],
            comments: comments.slice(0, 6000),
        },
    };

    let bxJson;
    try {
        bxJson = await bitrixJsonPost(base, 'crm.lead.add', leadAddPayload);
    } catch {
        return NextResponse.json({ error: 'Nie udało się połączyć z CRM.' }, { status: 502 });
    }

    if (bxJson.error && isBitrixMethodNotFound(bxJson)) {
        try {
            bxJson = await bitrixJsonPost(base, 'crm.item.add', itemAddPayload);
        } catch {
            return NextResponse.json({ error: 'Nie udało się połączyć z CRM.' }, { status: 502 });
        }
    }

    if (bxJson.error) {
        const msg = bitrixErrorMessage(bxJson);
        const hint =
            isBitrixMethodNotFound(bxJson) || msg.includes('Method not found')
                ? ' W Bitrix: nowy webhook przychodzący z uprawnieniem CRM (lub pełnym dostępem REST).'
                : '';
        return NextResponse.json({ error: `${msg}${hint}` }, { status: 502 });
    }

    const id = extractCreatedId(bxJson);
    if (id == null) {
        return NextResponse.json({ error: 'Nieoczekiwana odpowiedź CRM.' }, { status: 502 });
    }

    return NextResponse.json({ id });
}
