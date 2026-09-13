/**
 * Geo-matematyka globusa w czystym JS — BEZ importu `three`.
 *
 * Powód istnienia tego pliku: `src/utils/math.js` robi `import * as THREE`, a był importowany
 * przez `App.jsx`. To wciągało three.core (363 KB raw / 97 KB gz) do eager grupy chunków `App`,
 * która musi się w całości pobrać i sparsować przed pierwszym pikselem treści — mimo że App
 * potrzebuje stąd wyłącznie trygonometrii, a cały renderer siedzi za dynamicznym `WebGLCanvas`.
 *
 * Punkty reprezentujemy jako zwykłe `{x, y, z}`. Konwersja na `THREE.Vector3` następuje dopiero
 * po stronie globusa (patrz `math.js` i `CameraController`).
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const TWO_PI = Math.PI * 2;

/** lat/lng → punkt na sferze o danym promieniu. Zgodne 1:1 z poprzednim latLngToVector3. */
export function latLngToPoint(lat, lng, radius) {
    const phi = (90 - lat) * DEG2RAD;
    const theta = (lng + 180) * DEG2RAD;
    const sinPhi = Math.sin(phi);
    return {
        x: -radius * sinPhi * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * sinPhi * Math.sin(theta),
    };
}

/** Punkt → lat/lng. Przyjmuje składowe osobno, żeby działało i na Vector3, i na {x,y,z}. */
export function pointToLatLng(x, y, z, radius) {
    const phi = Math.acos(y / radius);
    const theta = Math.atan2(z, -x);
    const lat = 90 - phi * RAD2DEG;
    let lng = theta * RAD2DEG - 180;
    if (lng < -180) lng += 360;
    if (lng > 180) lng -= 360;
    return { lat, lng };
}

/**
 * Obrót wokół osi Y — odpowiednik `v.applyAxisAngle(new Vector3(0,1,0), angle)`.
 * Macierz Y z three (makeRotationY): x' = cos·x + sin·z, z' = -sin·x + cos·z.
 */
export function rotateAroundY({ x, y, z }, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: c * x + s * z, y, z: -s * x + c * z };
}

/** Normalizacja kąta do [-π, π] — zapobiega akumulacji błędu float przy długiej sesji. */
export function normalizeAngle(angle) {
    return angle - Math.round(angle / TWO_PI) * TWO_PI;
}

export function pointLength({ x, y, z }) {
    return Math.sqrt(x * x + y * y + z * z);
}
