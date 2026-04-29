import React, { useRef, useState, useEffect, useMemo, forwardRef, startTransition } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3 } from '../../utils/math';
import { GLOBE_RADIUS } from '../../constants/config';
import { COLORS } from '../../constants/colors';
import { GradientLineShader } from '../../shaders/GradientLineShader';
import { HolographicFillShader } from '../../shaders/HolographicFillShader';
import { AtmosphereShader } from '../../shaders/AtmosphereShader';
import { StartLogoMarker } from './StartLogoMarker';
import earcut from 'earcut';
import { PORTS } from '../../constants/ports';
import { PortMarker } from './PortMarker';
import { AnimatedRoutes } from './AnimatedRoutes';
import { detectPerfTier } from '../../utils/detectPerfTier';

const TARGET_COUNTRIES = [
    "United States of America",
    "United States",
    "Canada",
    "Germany",
    "Poland",
    "Netherlands"
];

// Quality settings per tier
const QUALITY_PRESETS = {
    LOW: {
        sphereSegments: 32,      // Atmosphere
        lineSteps: 1.0,          // Rzadsze linie
        shipCount: 1,            // 1 statek na trasę
        updateFrequency: 2,      // Co 2 frames
        enableGlow: false,
    },
    MID: {
        sphereSegments: 48,
        lineSteps: 0.5,
        shipCount: 2,
        updateFrequency: 1,
        enableGlow: true,
    },
    HIGH: {
        sphereSegments: 64,
        lineSteps: 0.3,
        shipCount: 3,
        updateFrequency: 1,
        enableGlow: true,
    }
};

// ============================================================
// INSTANCED SHIPS - Wszystkie statki w jednym draw call
// ============================================================
function InstancedShips({ isActive, quality }) {
    const meshRef = useRef();
    const dummyRef = useRef(new THREE.Object3D());

    const SHIP_ROUTES = [
        { start: [40.71, -74.00], end: [53.55, 8.58], color: '#1a4a8a' },
        { start: [25.76, -80.19], end: [51.92, 4.47], color: '#1e52a0' },
        { start: [29.76, -95.36], end: [53.55, 9.99], color: '#183d80' },
        { start: [32.08, -81.09], end: [51.21, 4.40], color: '#1e52a0' },
        { start: [33.74, -118.28], end: [35.67, 139.65], color: '#1a4590' },
    ];

    // Prepare ship data ONCE
    const shipData = useMemo(() => {
        const ships = [];
        const shipCount = QUALITY_PRESETS[quality].shipCount;

        SHIP_ROUTES.forEach((route, routeIdx) => {
            const start = latLngToVector3(route.start[0], route.start[1], GLOBE_RADIUS);
            const end = latLngToVector3(route.end[0], route.end[1], GLOBE_RADIUS);
            const mid = start.clone().lerp(end, 0.5);
            mid.normalize().multiplyScalar(GLOBE_RADIUS + 10);
            const curve = new THREE.CatmullRomCurve3([start, mid, end]);

            for (let i = 0; i < shipCount; i++) {
                ships.push({
                    id: routeIdx * shipCount + i,
                    curve,
                    color: new THREE.Color(route.color),
                    speed: 0.018 + Math.random() * 0.012,
                    offset: i / shipCount
                });
            }
        });

        return ships;
    }, [quality]);

    const totalShips = shipData.length;

    // Throttled update based on quality
    const frameCount = useRef(0);
    const updateFreq = QUALITY_PRESETS[quality].updateFrequency;

    useFrame((state) => {
        if (!meshRef.current || !isActive) return;

        frameCount.current++;
        if (frameCount.current % updateFreq !== 0) return; // Skip frames on LOW

        const time = state.clock.elapsedTime;

        shipData.forEach((ship, idx) => {
            const t = (time * ship.speed + ship.offset) % 1;
            const point = ship.curve.getPoint(t);

            dummyRef.current.position.copy(point);

            // Rotation towards movement direction
            const tangent = ship.curve.getTangent(t);
            dummyRef.current.lookAt(point.clone().add(tangent));

            dummyRef.current.updateMatrix();
            meshRef.current.setMatrixAt(idx, dummyRef.current.matrix);
            meshRef.current.setColorAt(idx, ship.color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }
    });

    if (!isActive) return null;

    return (
        <instancedMesh ref={meshRef} args={[null, null, totalShips]}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial />
        </instancedMesh>
    );
}

// ============================================================
// OPTIMIZED GLOBE - LOD + Instancing + Performance Detection
// ============================================================
export const ElegantGlobe = forwardRef(({
    perfTier: perfTierProp,
    onSelect,
    onHover,
    activeGeometry,
    hoverGeometry,
    globeRotation,
    isIntroDone,
    pauseAutoRotate = false,
    /** false = nie pobieraj world.geojson (odkłada ~200 KB z krytycznej ścieżki aż np. hero/LCP) */
    enableGeoFetch = true,
}, ref) => {
    const [geoData, setGeoData] = useState(null);
    const groupRef = useRef();

    const [fallbackPerfTier] = useState(() => detectPerfTier());
    const perfTier = perfTierProp ?? fallbackPerfTier;
    const quality = QUALITY_PRESETS[perfTier];

    const worldLinesRef = useRef();
    const targetLinesRef = useRef();
    const targetGlowLinesRef = useRef();
    const atmosRef = useRef();
    const floatingWaveRef = useRef();

    // ✅ Stable ref for onSelect — prevents infinite fetch loop
    const onSelectRef = useRef(onSelect);
    useEffect(() => { onSelectRef.current = onSelect; });

    // Debounce kliknięć — rozróżnia tap od drag (szczególnie ważne na mobile)
    const pointerDownPos = useRef(null);
    const CLICK_THRESHOLD_PX = 10;

    // Cleanup on unmount — dispose both geometries AND materials to prevent WebGL memory leaks
    useEffect(() => {
        return () => {
            const refs = [worldLinesRef, targetLinesRef, targetGlowLinesRef, atmosRef, floatingWaveRef];
            refs.forEach(ref => {
                const mesh = ref.current;
                if (!mesh) return;
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose());
                    } else {
                        mesh.material.dispose();
                    }
                }
            });
        };
    }, []);

    useEffect(() => {
        if (!enableGeoFetch) return undefined;
        const ac = new AbortController();
        fetch('/world.geojson', { signal: ac.signal })
            .then(res => res.json())
            .then(data => {
                // ✅ Przekaż dane do App zanim zaczniemy ciężkie przetwarzanie earcut
                onSelectRef.current?.('LOADED', data);
                // ✅ startTransition: earcut w useMemo odpali się w trybie concurrent
                // → React może yieldować między frames zamiast blokować główny wątek
                startTransition(() => setGeoData(data));
            })
            .catch((e) => {
                if (e?.name === 'AbortError') return;
            });
        return () => ac.abort();
    }, [enableGeoFetch]); // enableGeoFetch: jednorazowy start po odblokowaniu (np. isLoaded)

    // Optimized geometry generation with LOD
    const { worldLines, targetLines, targetGeometries } = useMemo(() => {
        if (!geoData) return { worldLines: null, targetLines: null, targetGeometries: [] };

        const wPts = [];
        const tPts = [];
        const tGeometries = [];

        const lineStep = quality.lineSteps; // Adaptive line density

        geoData.features.forEach(f => {
            const name = f.properties.NAME || f.properties.name || f.properties.admin;
            const isTarget = TARGET_COUNTRIES.includes(name);
            const geom = f.geometry;

            const processLine = (coords) => {
                for (let i = 0; i < coords.length - 1; i++) {
                    const p1 = latLngToVector3(coords[i][1], coords[i][0], GLOBE_RADIUS);
                    const p2 = latLngToVector3(coords[i + 1][1], coords[i + 1][0], GLOBE_RADIUS);

                    const dist = p1.distanceTo(p2);
                    const steps = Math.max(1, Math.ceil(dist / (isTarget ? 0.1 : lineStep)));

                    for (let k = 0; k < steps; k++) {
                        const t1 = k / steps;
                        const t2 = (k + 1) / steps;
                        const v1 = new THREE.Vector3().lerpVectors(p1, p2, t1).normalize().multiplyScalar(GLOBE_RADIUS + 0.02);
                        const v2 = new THREE.Vector3().lerpVectors(p1, p2, t2).normalize().multiplyScalar(GLOBE_RADIUS + 0.02);

                        if (isTarget) {
                            tPts.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
                        } else {
                            wPts.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
                        }
                    }
                }
            };

            const processMesh = (rawCoords) => {
                const flatCoords = [];
                rawCoords.forEach(pt => flatCoords.push(pt[0], pt[1]));
                const triangles = earcut(flatCoords, null, 2);

                // Simplified geometry (no subdivision on LOW)
                const vertices = new Float32Array(triangles.length * 3);

                for (let i = 0; i < triangles.length; i++) {
                    const idx = triangles[i];
                    const lon = flatCoords[idx * 2];
                    const lat = flatCoords[idx * 2 + 1];
                    const vec = latLngToVector3(lat, lon, GLOBE_RADIUS + 0.01);
                    vertices[i * 3] = vec.x;
                    vertices[i * 3 + 1] = vec.y;
                    vertices[i * 3 + 2] = vec.z;
                }

                const bufferGeo = new THREE.BufferGeometry();
                bufferGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
                bufferGeo.computeVertexNormals();
                tGeometries.push(bufferGeo);
            };

            if (isTarget) {
                if (geom.type === 'Polygon') {
                    processLine(geom.coordinates[0]);
                    processMesh(geom.coordinates[0]);
                } else if (geom.type === 'MultiPolygon') {
                    geom.coordinates.forEach(poly => {
                        processLine(poly[0]);
                        processMesh(poly[0]);
                    });
                }
            } else {
                if (geom.type === 'Polygon') {
                    geom.coordinates.forEach(processLine);
                } else if (geom.type === 'MultiPolygon') {
                    geom.coordinates.forEach(poly => poly.forEach(processLine));
                }
            }
        });

        // console.log(`✅ [${perfTier}] Created ${tGeometries.length} geometries`);

        return {
            worldLines: new Float32Array(wPts),
            targetLines: new Float32Array(tPts),
            targetGeometries: tGeometries
        };
    }, [geoData, perfTier]); // ✅ REMOVED quality object

    // Throttled rotation update
    const frameCount = useRef(0);
    useFrame((state) => {
        frameCount.current++;
        if (frameCount.current % quality.updateFrequency !== 0) return;

        const t = state.clock.elapsedTime;

        if (groupRef.current && !activeGeometry && isIntroDone && !pauseAutoRotate) {
            groupRef.current.rotation.y += 0.0003;
            if (globeRotation && globeRotation.current !== undefined) {
                globeRotation.current = groupRef.current.rotation.y;
            }
        }

        if (worldLinesRef.current) worldLinesRef.current.material.uniforms.uTime.value = t;
        if (targetLinesRef.current) targetLinesRef.current.material.uniforms.uTime.value = t;
        if (targetGlowLinesRef.current) targetGlowLinesRef.current.material.uniforms.uTime.value = t;

        // ✅ Animate new shader layers
        if (floatingWaveRef.current) floatingWaveRef.current.material.uniforms.uTime.value = t;
    });

    const combinedRef = (element) => {
        groupRef.current = element;
        if (ref) {
            typeof ref === 'function' ? ref(element) : (ref.current = element);
        }
    };

    return (
        <group ref={combinedRef}>

            {/* ATMOSFERA - adaptive segments */}
            <mesh scale={[1.2, 1.2, 1.2]} ref={atmosRef}>
                <sphereGeometry args={[GLOBE_RADIUS, quality.sphereSegments, quality.sphereSegments]} />
                <shaderMaterial
                    args={[AtmosphereShader]}
                    side={THREE.BackSide}
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Czarna kula - adaptive segments */}
            <mesh>
                <sphereGeometry args={[GLOBE_RADIUS - 0.05, quality.sphereSegments, quality.sphereSegments]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* LINIE ŚWIATA */}
            {worldLines && (
                <lineSegments ref={worldLinesRef}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={worldLines.length / 3} array={worldLines} itemSize={3} />
                    </bufferGeometry>
                    <shaderMaterial
                        args={[GradientLineShader]}
                        uniforms-colorStart-value={new THREE.Color('#0e2a50')}
                        uniforms-colorEnd-value={new THREE.Color('#1a4070')}
                        transparent depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        opacity={0.4}
                    />
                </lineSegments>
            )}

            {/* KRAJE DOCELOWE - linie */}
            {targetLines && (
                <lineSegments ref={targetLinesRef} renderOrder={4}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={targetLines.length / 3} array={targetLines} itemSize={3} />
                    </bufferGeometry>
                    <shaderMaterial
                        args={[GradientLineShader]}
                        uniforms-colorStart-value={new THREE.Color('#FFFFFF')}
                        uniforms-colorEnd-value={new THREE.Color(COLORS.gradientEnd)}
                        transparent depthTest={true} depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        linewidth={1}
                        polygonOffset={true} polygonOffsetFactor={-4}
                    />
                </lineSegments>
            )}

            {/* KRAJE DOCELOWE - glow (only on MID/HIGH) */}
            {targetLines && quality.enableGlow && (
                <lineSegments ref={targetGlowLinesRef} renderOrder={5} scale={[1.002, 1.002, 1.002]}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={targetLines.length / 3} array={targetLines} itemSize={3} />
                    </bufferGeometry>
                    <shaderMaterial
                        args={[GradientLineShader]}
                        uniforms-colorStart-value={new THREE.Color(COLORS.gradientEnd)}
                        uniforms-colorEnd-value={new THREE.Color(COLORS.gradientEnd)}
                        transparent depthTest={true} depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        opacity={0.6}
                        polygonOffset={true} polygonOffsetFactor={-6}
                    />
                </lineSegments>
            )}

            {/* KRAJE DOCELOWE - fill */}
            {targetGeometries && targetGeometries.map((geom, idx) => (
                <mesh key={idx} geometry={geom} renderOrder={3} frustumCulled={true}>
                    <shaderMaterial
                        args={[HolographicFillShader]}
                        transparent side={THREE.DoubleSide}
                        depthTest={true} depthWrite={false}
                        blending={THREE.AdditiveBlending}
                        polygonOffset={true} polygonOffsetFactor={-2}
                        uniforms-uTime-value={0}
                        uniforms-uOpacity-value={0.8}
                    />
                </mesh>
            ))}

            <StartLogoMarker />

            <AnimatedRoutes show={isIntroDone} perfTier={perfTier} />

            {/* INSTANCED SHIPS - 1 draw call zamiast 15 */}
            <InstancedShips isActive={isIntroDone} quality={perfTier} />

            {/* Porty - conditional rendering based on performance, not clickable */}
            {isIntroDone && perfTier !== 'LOW' && PORTS.map(port => (
                <PortMarker key={port.id} port={port} />
            ))}

            {/* Hitbox dla interakcji */}
            <mesh
                visible={false}
                frustumCulled={false}
                onPointerDown={(e) => {
                    e.stopPropagation();
                    // Zapamiętaj pozycję startu — do odróżnienia tap vs drag
                    pointerDownPos.current = { x: e.clientX ?? e.nativeEvent?.clientX ?? 0, y: e.clientY ?? e.nativeEvent?.clientY ?? 0 };
                }}
                onPointerUp={(e) => {
                    e.stopPropagation();
                    if (!pointerDownPos.current || !onSelect || !groupRef.current) return;
                    const dx = (e.clientX ?? 0) - pointerDownPos.current.x;
                    const dy = (e.clientY ?? 0) - pointerDownPos.current.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    pointerDownPos.current = null;
                    // Tylko jeśli ruch był mniejszy niż próg — to tap, nie drag
                    if (dist < CLICK_THRESHOLD_PX) {
                        onSelect('CLICK', { point: e.point, rot: groupRef.current.rotation.y });
                    }
                }}
                onPointerMove={(e) => {
                    e.stopPropagation();
                    if (onHover && groupRef.current) {
                        onHover(e.point, groupRef.current.rotation.y, e);
                    }
                }}
                onPointerOut={() => {
                    pointerDownPos.current = null;
                    if (onHover) onHover(null, null, null);
                }}
            >
                <sphereGeometry args={[GLOBE_RADIUS + 0.5, 32, 32]} />
            </mesh>

        </group>
    );
});

ElegantGlobe.displayName = 'ElegantGlobe';