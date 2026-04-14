import * as THREE from 'three';

export function latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

export function vector3ToLatLng(x, y, z, radius) {
    const phi = Math.acos(y / radius);
    const theta = Math.atan2(z, -x);
    const lat = 90 - (phi * 180 / Math.PI);
    let lng = (theta * 180 / Math.PI) - 180;
    if (lng < -180) lng += 360;
    if (lng > 180) lng -= 360;
    return { lat, lng };
}