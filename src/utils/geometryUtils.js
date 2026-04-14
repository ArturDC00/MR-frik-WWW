import * as THREE from 'three';
import { latLngToVector3 } from './math';
import { GLOBE_RADIUS } from '../constants/config';

// Funkcja dzieląca trójkąt na 4 mniejsze (Subdivision)
// Dzięki temu siatka "okala" kulę, zamiast ją przecinać.
export function subdivideTriangle(a, b, c, level, radius) {
    if (level <= 0) {
        return [a, b, c];
    }

    // Znajdź środki krawędzi
    const ab = new THREE.Vector3().addVectors(a, b).normalize().multiplyScalar(radius);
    const bc = new THREE.Vector3().addVectors(b, c).normalize().multiplyScalar(radius);
    const ca = new THREE.Vector3().addVectors(c, a).normalize().multiplyScalar(radius);

    // Rekurencyjnie dziel dalej
    return [
        ...subdivideTriangle(a, ab, ca, level - 1, radius),
        ...subdivideTriangle(b, bc, ab, level - 1, radius),
        ...subdivideTriangle(c, ca, bc, level - 1, radius),
        ...subdivideTriangle(ab, bc, ca, level - 1, radius)
    ];
}

// Główna funkcja przetwarzająca punkty 2D na gęstą siatkę 3D
export function createDenseGeometry(triangles, flatCoords, radius) {
    const vertices = [];

    // Iterujemy po trójkątach z earcut
    for (let i = 0; i < triangles.length; i += 3) {
        const idx1 = triangles[i];
        const idx2 = triangles[i + 1];
        const idx3 = triangles[i + 2];

        const p1 = latLngToVector3(flatCoords[idx1 * 2 + 1], flatCoords[idx1 * 2], radius);
        const p2 = latLngToVector3(flatCoords[idx2 * 2 + 1], flatCoords[idx2 * 2], radius);
        const p3 = latLngToVector3(flatCoords[idx3 * 2 + 1], flatCoords[idx3 * 2], radius);

        // Poziom 3 daje bardzo gęstą siatkę (Google Style)
        // Dla bardzo dużych krajów (USA, Rosja) to kluczowe
        const subTriangles = subdivideTriangle(p1, p2, p3, 3, radius);

        subTriangles.forEach(v => {
            vertices.push(v.x, v.y, v.z);
        });
    }

    return new Float32Array(vertices);
}