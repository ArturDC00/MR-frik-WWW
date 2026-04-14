import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '../../utils/math';
import { GLOBE_RADIUS } from '../../constants/config';
import { COLORS } from '../../constants/colors';

// Prosta definicja tras (Start -> Koniec)
const SHIP_ROUTES = [
    { start: [40.669, -74.174], end: [53.542, 8.571] }, // NY -> Bremerhaven
    { start: [25.774, -80.176], end: [51.924, 4.477] }, // Miami -> Rotterdam
    { start: [29.749, -95.358], end: [53.548, 9.987] }, // Houston -> Hamburg
    { start: [32.080, -81.091], end: [51.219, 4.402] }, // Savannah -> Antwerpia
];

function Ship({ route, offset, speed }) {
    const meshRef = useRef();

    // Obliczamy krzywą trasy (Bezier)
    const curve = useMemo(() => {
        const startPos = latLngToVector3(route.start[0], route.start[1], GLOBE_RADIUS);
        const endPos = latLngToVector3(route.end[0], route.end[1], GLOBE_RADIUS);

        // Punkt kontrolny (wypiętrzenie krzywej), żeby statki nie płynęły pod ziemią
        // i żeby trasa miała ładny łuk
        const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5).normalize().multiplyScalar(GLOBE_RADIUS + 2);

        return new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
    }, [route]);

    useFrame((state) => {
        if (!meshRef.current) return;

        // Obliczamy pozycję na krzywej (0 do 1)
        // offset przesuwa statek, speed decyduje jak szybko płynie
        const t = (state.clock.elapsedTime * speed + offset) % 1;

        // Pobieramy punkt na krzywej
        const point = curve.getPoint(t);
        meshRef.current.position.copy(point);

        // Ustawiamy statek przodem do kierunku ruchu
        const tangent = curve.getTangent(t).normalize();
        meshRef.current.lookAt(point.clone().add(tangent));
    });

    return (
        <group ref={meshRef}>
            {/* Statek (prosty kształt) */}
            <mesh rotation={[0, -Math.PI / 2, 0]}> {/* Obrót, żeby był wzdłuż linii */}
                <boxGeometry args={[0.5, 0.1, 0.2]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Światło pozycyjne (Glow) */}
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial color={COLORS.gradientEnd} transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

export function LogisticsFlow() {
    return (
        <group>
            {SHIP_ROUTES.map((route, i) => (
                <React.Fragment key={i}>
                    {/* Generujemy kilka statków na każdej trasie z różnym przesunięciem (offset) */}
                    <Ship route={route} offset={i * 0.2} speed={0.05} />
                    <Ship route={route} offset={i * 0.2 + 0.5} speed={0.05} />
                </React.Fragment>
            ))}
        </group>
    );
}