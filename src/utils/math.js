import * as THREE from 'three';
import { latLngToPoint, pointToLatLng } from './geoMath';

/**
 * Warianty three-owe dla kodu globusa (R3F/shadery), gdzie Vector3 jest i tak potrzebny.
 * Sama trygonometria żyje w `geoMath.js` bez zależności od three — dzięki temu App i inne
 * moduły poza canvasem nie wciągają three.core do krytycznej ścieżki.
 */
export function latLngToVector3(lat, lng, radius) {
    const { x, y, z } = latLngToPoint(lat, lng, radius);
    return new THREE.Vector3(x, y, z);
}

export const vector3ToLatLng = pointToLatLng;
