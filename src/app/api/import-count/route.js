import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'import_display_counts.json');

function getClientIp(headerList) {
    const xff = headerList.get('x-forwarded-for');
    if (xff) {
        const first = xff.split(',')[0].trim();
        if (first) return first;
    }
    return headerList.get('x-real-ip') || headerList.get('cf-connecting-ip') || 'unknown';
}

function storageKey(ip) {
    const salt = process.env.IMPORT_COUNTER_SALT || 'mrfrik-import-counter-v1';
    return crypto.createHmac('sha256', salt).update(ip).digest('hex').slice(0, 48);
}

async function loadMap() {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        const data = JSON.parse(raw);
        return typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {};
    } catch {
        return {};
    }
}

async function saveMap(map) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(map), 'utf8');
    await fs.rename(tmp, DATA_FILE);
}

/**
 * GET — zwraca monotonicznie rosnącą liczbę „sprowadzonych aut” dla danego IP (marketing).
 * Pierwsza odpowiedź: 2200, kolejne wizyty z tego samego IP: +1.
 */
export async function GET() {
    const headerList = await headers();
    const ip = getClientIp(headerList);
    const key = storageKey(ip);

    const base = 2200;

    for (let attempt = 0; attempt < 6; attempt++) {
        try {
            const map = await loadMap();
            let v = map[key];
            if (typeof v !== 'number' || Number.isNaN(v)) {
                v = base;
            } else {
                v += 1;
            }
            map[key] = v;
            await saveMap(map);
            return NextResponse.json({ count: v }, { headers: { 'Cache-Control': 'no-store' } });
        } catch {
            await new Promise((r) => setTimeout(r, 25 + attempt * 20));
        }
    }

    return NextResponse.json({ count: base, warning: 'persist_failed' }, { status: 200 });
}
