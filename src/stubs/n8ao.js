/**
 * Stub dla `n8ao` — tranzytywnej zależności @react-three/postprocessing.
 *
 * Dlaczego: barrel @react-three/postprocessing robi `import { N8AOPostPass } from 'n8ao'`.
 * n8ao nie deklaruje `sideEffects: false`, więc webpack wycina wszystkie jego *eksporty*
 * (N8AOPostPass nie występuje w żadnym zbudowanym chunku), ale zostawia top-level
 * `Uint8Array.from(atob("<87 384 znaków>"), ...)` z BlueNoise.js — wywołanie globalnej funkcji
 * nie jest dla niego dowodliwie czyste. Efekt: przeglądarka ściągała 85,8 KB raw / 64,7 KB gz
 * (base64 praktycznie się nie kompresuje), dekodowała 87 KB na main threadzie i wyrzucała wynik.
 *
 * Efekt <N8AO> nie jest w tej aplikacji renderowany nigdzie — WebGLCanvas importuje tylko
 * { EffectComposer, Bloom }.
 *
 * ⚠️ Jeśli kiedyś dojdzie potrzeba użycia <N8AO> / ambient occlusion: usuń alias `n8ao`
 * z `webpack()` w next.config.mjs, żeby wrócić do prawdziwej paczki. Ten stub NIE degraduje
 * się do no-op passa — celowo rzuca, żeby taki błąd był głośny, a nie cicho psuł render.
 */

const MESSAGE =
    '[n8ao stub] Prawdziwa paczka n8ao jest wyaliasowana w next.config.mjs, żeby nie ' +
    'wysyłać 86 KB martwej tekstury BlueNoise. Chcesz użyć <N8AO>? Usuń alias `n8ao` ' +
    'z hooka webpack() w next.config.mjs.';

export class N8AOPostPass {
    constructor() {
        throw new Error(MESSAGE);
    }
}

export class N8AOPass {
    constructor() {
        throw new Error(MESSAGE);
    }
}

export default { N8AOPostPass, N8AOPass };
